import { useState, useEffect, useContext, Fragment } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import L10n from "../L10n.json";
import { LanguageContext } from "../context/language-context";
import EventsList from '../components/home page/EventsList'
import Searchbar from '../components/home page/Searchbar'
import { connectClient } from "../utils/MongoDbUtils";

export default function Home({ allEvents, dbError }) {
  const { language } = useContext(LanguageContext);
  const [events, setEvents] = useState(allEvents || []);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const filterEvents = (value) => {
    setEvents(() => {
      const newState = allEvents.filter(event =>
        event.title.toLowerCase().indexOf(value.toLowerCase()) != -1 ||
        event.date.toLowerCase().indexOf(value.toLowerCase()) != -1 ||
        event.location.toLowerCase().indexOf(value.toLowerCase()) != -1 ||
        event.time.toLowerCase().indexOf(value.toLowerCase()) != -1);
      return newState;
    });
  }

  useEffect(() => {
    // check the url for queries used for filtering
    const filterText = router.query.search;
    setSearchQuery(filterText);
    if (filterText) {
      filterEvents(filterText);
    }
  }, [router.isReady]);

  const searchHandler = (value) => {
    // filter the state
    filterEvents(value);
    // change the url
    router.push({
      pathname: router.pathname,
      query: { ...router.query, search: value }
    });
  }

  return (
    <Fragment>
      <Head>
        <title>Smart Event Planner: Home</title>
        <meta
          name="description"
          content={"This page is dedicated to viewing all events deshboard."}>
        </meta>
      </Head>

      <div>
        <h1>{L10n[language].page_title}:</h1>
        <Searchbar onSearch={searchHandler} language={language} value={searchQuery} L10n={L10n} />
        <div className="belowTitleContent">
          {dbError ? <p className="error">{L10n[language].error}</p> : <EventsList events={events} L10n={L10n} />}
        </div>
      </div>
    </Fragment>
  )
}

// Let's imagine we have A LOT of requests, HUGE TRAFFIC.
// For this, our server has to be protected from overgenerating the same page more then what is needed.
export async function getStaticProps() {
  try {
    const client = await connectClient();
    const db = client.db();

    const eventsCollection = db.collection("events");
    const events = await eventsCollection.find().project({endTime: 0, endDate: 0, authorId: 0, authorName: 0}).toArray();

    client.close();
    return {
      revalidate: 300, // every 5 minutes should be fine
      props: {
        allEvents: events.length ? events.map(e => ({
          id: e._id.toString(),
          title: e.title,
          startDate: e.startDate,
          startTime: e.startTime,
          location: e.location,
          description: e.description,
        })) : []
      }
    }
  } catch (e) {
    return {
      props: {
        dbError: true
      }
    }
  }

}

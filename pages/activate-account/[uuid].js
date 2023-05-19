import { Fragment } from "react";
import Head from "next/head";
import { connectClient } from "../../utils/MongoDbUtils";
import L10n from "../../L10n.json";

const ActivateAccountPage = ({ message }) => {

  return (
    <Fragment>
      <Head>
        <title>Smart Event Planner: Account Activation Page</title>
        <meta
          name="description"
          content={"This page is dedicated to activating a user's account."}>
        </meta>
      </Head>

      <div>
        <h1>{message}.</h1>
      </div>
    </Fragment>
  );
};

export async function getServerSideProps(context) {
  const { uuid } = context.query;
  const language = context.query.language || "en";

  const client = await connectClient();
  const db = client.db();
  const usersCollection = db.collection("users");

  try {
    const response = await usersCollection.updateOne({ activationCode: uuid }, {
      $set: {
        activated: true,
      },
      $unset: {
        activationCode: ""
      }
    })
    console.log(response);

    client.close();

    if (response.modifiedCount === 0) {
      return {
        props: {
          message: L10n[language].account_activation_error
        }
      }
    } else return {
      props: {
        message: L10n[language].account_activated
      }
    }
  } catch (error) {
    client.close();

    console.log(error);
    return {
      props: {
        message: L10n[language].error
      }
    }
  }



}

export default ActivateAccountPage;

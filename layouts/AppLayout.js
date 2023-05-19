import { Fragment, useEffect, useContext, useState } from 'react';
import { useRouter } from 'next/router';
import { LanguageContext } from '../context/language-context';
import Navbar from '../components/navbar/Navbar';

const AppLayout = (props) => {
  const { language, setLanguage } = useContext(LanguageContext);
  const [navBarActive, setNavBarActive] = useState(false);
  const router = useRouter();

  const selectHandler = (e) => {
    const { value: language } = e.target;
    setLanguage(language);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, language: language }
    });
  }

  useEffect(() => {
    // check the url for the language query
    const l = router.query.language;
    if (l === "ro") {
      setLanguage("ro");
    } else {
      setLanguage("en");
    }
  }, [router.isReady])

  return (
    <Fragment>
      <Navbar navBarActive={navBarActive} setNavBarActive={setNavBarActive} selectHandler={selectHandler} language={language} />
      <div className={`pageContent ${navBarActive ? "blured" : ""}`}>
        {props.children}
      </div>
    </Fragment>
  );
};

export default AppLayout;
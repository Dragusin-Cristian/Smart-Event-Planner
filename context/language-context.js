import { createContext, useState } from "react";

export const LanguageContext = createContext({ language: "en", setLanguage: () => { } });

export default props => {
  const [language, setLanguage] = useState("en");

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {props.children}
    </LanguageContext.Provider>
  )
}
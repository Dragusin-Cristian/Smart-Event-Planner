import Link from "next/link";
import Image from "next/image"
import { useSession, signOut } from "next-auth/react";
import classes from "./Navbar.module.css"
import L10n from "../../L10n.json";
import { checkIfSessionAuthenticated } from "../../utils/AuthUtils";
import BurgerIcon from "../../utils/assets/icons8-menu.svg"

const Navbar = ({ navBarActive, setNavBarActive, selectHandler, language }) => {
  const session = useSession();

  const authenticated = checkIfSessionAuthenticated(session);

  const logoutHandler = () => {
    deAtivateNavBar();
    signOut(); //TODO handle the result here
  }

  const handleNavBarActive = () => {
    setNavBarActive(oldState => !oldState)
  }

  const deAtivateNavBar = () => {
    setNavBarActive(false);
  }

  return (
    <div className={classes.NavbarContainer}>
      <div className={classes.burgerContainer}>
        <Image onClick={handleNavBarActive} className={classes.burgerIc} priority src={BurgerIcon} />
      </div>
      <div className={navBarActive ? classes.navBarControlsContainer : classes.hiddenNavBarControlsContainer}>
        <div className={classes.flexContainer}>
          <Link onClick={deAtivateNavBar} href={`/?language=${language}`}><p className={classes.NavbarLink}>{L10n[language].all_events}</p></Link>
          {authenticated && <Link onClick={deAtivateNavBar} href={`/create-new-event?language=${language}`}><p className={classes.NavbarLink}>{L10n[language].add_event}</p></Link>}
          {!authenticated && <Link onClick={deAtivateNavBar} href={`/authentication?language=${language}`}><p className={classes.NavbarLink}>{L10n[language].authenticate_word}</p></Link>}
          {authenticated && <Link onClick={deAtivateNavBar} href={`/profile?language=${language}`}><p className={classes.NavbarLink}>{L10n[language].profile_word}</p></Link>}
        </div>
        <div className={classes.flexContainer}>
          {authenticated && <button className={classes.LogoutButton} onClick={logoutHandler}>{L10n[language].logout_word}</button>}
          <div>
            <label className={classes.Label} htmlFor="languages">{L10n[language].change_language}:</label>
            <select name="languages" onChange={selectHandler} value={language}>
              <option value="ro">Romana</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>
    </div>

  );
};

export default Navbar;
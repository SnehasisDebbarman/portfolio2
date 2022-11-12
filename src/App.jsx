import React, { useRef, useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import "./App.scss";
import { GoTerminal } from "react-icons/go";
import { Switch } from "@chakra-ui/react";
import CustomSwitch from "./SwitchComponent/Switch";
import { useColorMode } from "@chakra-ui/react";
import didYouMean from "didyoumean";

import empty from "./assets/images/SVG/empty.svg";
import { FaBeer, FaGreaterThan } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
const personalData = {
  name: "Snehasis",
  age: "24",
  education: "B. Tech in Computer Science and Technology",
  hello: "hi Stranger!!",
  hi: "Hi Stranger!!",
  details: `Hi I am Snehasis and I am a UI Developer in Fyllo`,
  help: "",
  list: "",
};
let guessList = Object.keys(personalData);
console.log(guessList);

function App() {
  const { toggleColorMode, colorMode } = useColorMode();
  const [TerminalInput, setTerminalInput] = useState("");
  const [personalDataShown, setPersonalDataShown] = useState([
    {
      searchQuery: "Welcome",
      value: "Hello World",
    },
  ]);
  const [LastUuid, setLastUUid] = useState("");
  const inputRef = useRef();
  const bottomRef = useRef();
  useEffect(() => {
    inputRef.current.focus();
    bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [personalDataShown]);

  const handleKeyPress = (event) => {
    event.preventDefault();
    let text = event.target.value.toLowerCase();
    if (event.key === "Enter") {
      console.log("enter press here! ");

      let i = [...personalDataShown];
      let dym = didYouMean(text, guessList);
      i.push({
        searchQuery: text,
        value: personalData[text]
          ? personalData[text]
          : dym
          ? `sorry no result found... did you mean "${dym}"`
          : "sorry no result found... type 'help' for more information",
      });
      setPersonalDataShown(i);
      setTerminalInput("");
    }
  };
  const handleChange = (event) => {
    setTerminalInput(event.target.value);
  };
  return (
    <React.Fragment>
      <header
        style={{
          boxShadow: " 10px 10px 0 0 red",
        }}
      >
        <nav
          style={{
            backgroundColor: colorMode === "dark" ? "#242424" : "#e5e5e5",
            transition: "background-color .5s ease",
            WebkitTransition: "background-color .5s ease",
            MozTransition: "background-color .5s ease",
          }}
        >
          <ul className="nav-container">
            <li
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {" "}
              <GoTerminal size={30} />
              <h2 style={{ fontSize: 16 }}>Snehasis Debbarman</h2>
            </li>
            <li>
              <CustomSwitch />
            </li>
          </ul>
        </nav>
      </header>
      <div>
        <div className="p-10 pt-24 terminal ">
          <div className="border-2 border-gray-50 border-radius rounded-lg">
            <div
              style={{
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
              }}
              className="text-center bg-fuchsia-800 "
            >
              Snehasis.exe
            </div>
            <div
              style={{
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8,
                backgroundColor: colorMode === "dark" ? "#242424" : "#e5e5e5",
              }}
              className="p-10  h-[60vh] overflow-auto"
            >
              <div className="flex flex-col justify-start items-start gap-0 ">
                {/* <FaGreaterThan /> */}
                {personalDataShown.map((item) => {
                  return (
                    <div key={uuidv4()} className="flex flex-col gap-1 ">
                      <div className="flex flex-row gap-2">
                        <div className="text-green-400"> {"snehasis ~ $ "}</div>
                        {item.searchQuery}
                      </div>
                      {item.searchQuery === "help" ? (
                        <React.Fragment>
                          <div>Please Choose one of the option:</div>
                          {guessList.map((helpItem, i) => (
                            <div className="text-yellow-400" key={uuidv4()}>
                              {" "}
                              ~ {helpItem}
                            </div>
                          ))}
                        </React.Fragment>
                      ) : (
                        <div
                          style={{
                            whiteSpace: "pre",
                          }}
                          className={
                            item?.value?.includes("sorry") ? "text-red-500" : ""
                          }
                        >
                          {item.value}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-row justify-start items-center gap-4 pb-5">
                <div className="text-green-400"> {"snehasis ~ $ "}</div>
                <input
                  ref={inputRef}
                  style={{
                    all: "unset",
                  }}
                  onKeyUp={handleKeyPress}
                  onChange={handleChange}
                  value={TerminalInput}
                ></input>
              </div>
              <div ref={bottomRef}></div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default App;

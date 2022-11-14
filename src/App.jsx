import React, { useRef, useState, useEffect, forwardRef } from "react";
import reactLogo from "./assets/react.svg";
import "./App.scss";
import { GoTerminal } from "react-icons/go";
import { Switch } from "@chakra-ui/react";
import CustomSwitch from "./SwitchComponent/Switch";
import { useColorMode } from "@chakra-ui/react";
import didYouMean from "didyoumean";
import { v4 as uuidv4 } from "uuid";
import CustomRadio from "./CustomRadio/CustomRadio";
import { createRef } from "react";

const personalData = {
  name: "Snehasis",
  age: "24",
  education: "B. Tech in Computer Science and Technology",
  hello: "hi Stranger!!",
  hi: "Hi Stranger!!",
  details: `Hi I am Snehasis and I am a UI Developer in Fyllo`,
  company: `
  _________________________________________________________________
  |                                                               |
  | Company Name: Fyllo,                          May,2022-Present|
  | Designation: UI Developer                                     |
  |_______________________________________________________________|

  `,
  help: "",
  list: "yhshs",
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
  const [ShowInput, setShowInput] = useState(true);
  const inputRef = useRef();
  const bottomRef = useRef();
  const containerRef = createRef();
  const SelectRef = useRef();

  useEffect(() => {
    if (TerminalInput === "help") {
      SelectRef?.current.focus();
    } else {
      inputRef?.current?.focus();
    }

    bottomRef.current.scrollIntoView({ block: "end" });
  }, [personalDataShown]);

  const handleKeyPress = (event) => {
    event.preventDefault();
    let text = event.target.value.toLowerCase();
    if (event.key === "Enter") {
      setSearchQuery(text);
    }
  };
  function setSearchQuery(text) {
    console.log("enter press here! ");
    if (text === "help") {
      setShowInput(false);
    }

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
  const handleChange = (event) => {
    setTerminalInput(event.target.value);
  };
  return (
    <div
      style={{
        overflow: "hidden",
      }}
    >
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
      <div className=" overflow-hidden h-[100vh]">
        <div className="p-10 pt-24 terminal ">
          <div
            style={{
              backgroundColor: colorMode === "dark" ? "#242424" : "#e5e5e5",
            }}
            className="border-2 border-gray-50 border-radius rounded-lg  overflow-y-hidden fixed w-[90vw]"
          >
            <div
              style={{
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
              }}
              className="text-center bg-fuchsia-800 fixed  w-[90vw]"
            >
              Snehasis.exe
            </div>
            <div
              style={{
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8,
                backgroundColor: colorMode === "dark" ? "#242424" : "#e5e5e5",
                height: "60vh",
                overflow: "scroll",
              }}
              ref={containerRef}
              className="p-10 "
            >
              <div className="flex flex-col justify-start items-start ">
                {/* <FaGreaterThan /> */}
                {personalDataShown.map((item) => {
                  return (
                    <div key={uuidv4()} className="flex flex-col gap-1 ">
                      <div className="flex flex-row gap-2">
                        <div className="text-green-400"> {"snehasis ~ $ "}</div>
                        {item.searchQuery}
                      </div>
                      {item.searchQuery === "help" ? (
                        <div>
                          <div>Please Choose one of the option:</div>
                          <CustomRadio
                            guessList={guessList}
                            setSearchQuery={setSearchQuery}
                            TerminalInput={TerminalInput}
                            setShowInput={setShowInput}
                            SelectRef={SelectRef}
                          />
                        </div>
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
              {ShowInput && (
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
              )}

              <div
                style={{
                  marginTop: "100px",
                }}
                ref={bottomRef}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

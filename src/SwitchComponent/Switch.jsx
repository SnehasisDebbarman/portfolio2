import React, { useState } from "react";
import "./switch.scss";
import {
  Box,
  HStack,
  IconButton,
  Switch,
  useColorMode,
} from "@chakra-ui/react";
import { FaMoon, FaSun } from "react-icons/fa";

const CustomSwitch = () => {
  const { toggleColorMode, colorMode } = useColorMode();
  const [startAnim, setstartAnim] = useState(false);

  function onAnimEnd({ animationName }) {
    if (animationName === "Rotation") {
      setstartAnim(true);
    }

    if (animationName === "ReverseRotation") {
      setstartAnim(false);
    }
  }
  return (
    <div
      style={{
        width: "4rem",
        background: "#9ca3af",
        borderRadius: "20px",
        padding: 1,
        paddingLeft: 2,
        paddingRight: 2,
        paddingBottom: 3,
      }}
    >
      {/* <div className={colorMode === "dark" ? "icon-dark" : "icon-light"}> */}
      <IconButton
        onAnimationEnd={(event) => {
          onAnimEnd(event);
        }}
        className={colorMode === "dark" ? "icon-dark" : "icon-light"}
        style={{
          backgroundColor: colorMode !== "dark" ? "#fdba74" : "white",
        }}
        aria-label="toggle theme"
        rounded="full"
        size="xs"
        onClick={() => {
          toggleColorMode();
        }}
        icon={
          colorMode !== "dark" ? (
            <FaSun color="white" />
          ) : (
            <FaMoon color="#404040" />
          )
        }
      />
      {/* </div> */}
    </div>
  );
};

export default CustomSwitch;

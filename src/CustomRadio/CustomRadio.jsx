// 1. Create a component that consumes the `useRadio` hook
import {
  Radio,
  RadioGroup,
  useRadio,
  HStack,
  Box,
  useRadioGroup,
} from "@chakra-ui/react";
import { useRef, useEffect } from "react";
function RadioCard(props) {
  const { getInputProps, getCheckboxProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getCheckboxProps();

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        _checked={{
          bg: "teal.600",
          color: "white",
          borderColor: "teal.600",
        }}
        _focus={{
          boxShadow: "outline",
        }}
        style={{
          fontSize: "12px",
          padding: "5px 10px",
          borderRadius: "5px",
        }}
      >
        {props.children}
      </Box>
    </Box>
  );
}

// Step 2: Use the `useRadioGroup` hook to control a group of custom radios.
export default function CustomRadio({
  guessList,
  setSearchQuery,
  setShowInput,
  SelectRef,
  TerminalInput,
}) {
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "checkbox",
    defaultValue: TerminalInput ?? guessList[0],
    onChange: (data) => {
      setSearchQuery(data);
      setShowInput(true);
    },
    ref: SelectRef,
    isFocusable: true,
    focus: () => {},
  });

  const group = getRootProps();

  return (
    <div>
      {guessList.map((value, i) => {
        const radio = getRadioProps({ value });

        return (
          <RadioCard key={value} {...radio}>
            {value}
          </RadioCard>
        );
      })}
    </div>
  );
}

import { useRadio, Box, useRadioGroup } from "@chakra-ui/react";

function RadioCard(props) {
  const { getInputProps, getCheckboxProps } = useRadio(props);
  const input    = getInputProps();
  const checkbox = getCheckboxProps();

  return (
    <Box as="label" margin="0 !important">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        _checked={{ bg: "#31C3BD", color: "#0e1e24", borderColor: "#31C3BD", fontWeight: "bold" }}
        _focus={{ boxShadow: "0 0 0 2px rgba(49,195,189,0.5)" }}
        style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "4px",
                 background: "#1a2d36", border: "1px solid #253545", color: "#a8b8c4",
                 transition: "all 0.15s" }}
      >
        {props.children}
      </Box>
    </Box>
  );
}

export default function CustomRadio({ guessList, setSearchQuery, SelectRef }) {
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "terminal-cmd",
    defaultValue: "",
    onChange: (val) => setSearchQuery(val),
    ref: SelectRef,
    isFocusable: true,
  });

  const group = getRootProps();
  const filtered = guessList.filter((c) => c !== "clear" && c !== "matrix" && c !== "secret");

  return (
    <div {...group} className="flex flex-wrap gap-2 mt-1">
      {filtered.map((value) => (
        <RadioCard key={value} {...getRadioProps({ value })}>
          {value}
        </RadioCard>
      ))}
    </div>
  );
}


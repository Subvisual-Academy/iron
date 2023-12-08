import { TextField } from "@mui/material";
import {
  Control,
  Controller,
  FieldError,
  FieldPath,
  FieldValues,
} from "react-hook-form";

interface Props<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
  control: Control<TFieldValues>;
  error?: FieldError;
  decimals: number;
}

export function BigIntField<C extends FieldValues>({
  control,
  name,
  error,
  decimals = 18,
}: Props<C>) {
  const multiplier = 10n ** BigInt(decimals);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          label="Amount"
          error={!!error}
          helperText={error?.message?.toString() || ""}
          fullWidth
          onChange={(e) => field.onChange(BigInt(e.target.value) * multiplier)}
          value={(BigInt(field.value) / multiplier).toString()}
        />
      )}
    />
  );
}

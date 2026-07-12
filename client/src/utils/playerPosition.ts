const POSITION_CLASSES: Record<
  string,
  string
> = {
  QB: "position-qb",
  RB: "position-rb",
  WR: "position-wr",
  TE: "position-te",
  K: "position-k",
  DEF: "position-def",
  DST: "position-def"
};


export function getPositionClass(
  position: string
): string {
  const normalizedPosition =
    position
      .toUpperCase()
      .replace(
        /[^A-Z]/g,
        ""
      );


  return (
    POSITION_CLASSES[
      normalizedPosition
    ] ??
    "position-default"
  );
}


export function getPositionLabel(
  position: string
): string {
  const normalizedPosition =
    position
      .toUpperCase()
      .replace(
        /[^A-Z]/g,
        ""
      );


  if (
    normalizedPosition === "DST"
  ) {
    return "DEF";
  }


  return (
    normalizedPosition ||
    position
  );
}
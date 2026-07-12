interface CountdownProps {

  seconds: number;

}

export default function Countdown({
  seconds
}: CountdownProps) {

  return (

    <div>

      <div
        style={{
          opacity: 0.7,
          fontSize: "18px"
        }}
      >
        TIME REMAINING
      </div>

      <div
        style={{
          fontSize: "80px",
          fontWeight: 700
        }}
      >
        {seconds}
      </div>

    </div>

  );

}
interface Props {

  text: string;

}


function Badge({
  text
}: Props) {


  return (

    <span className={`badge ${text}`}>

      {text}

    </span>

  );

}


export default Badge;
interface Props {

  children: React.ReactNode;

  onClick?: () => void;

}


function Button({
  children,
  onClick
}: Props) {


  return (

    <button
      onClick={onClick}
      className="app-button"
    >

      {children}

    </button>

  );

}


export default Button;
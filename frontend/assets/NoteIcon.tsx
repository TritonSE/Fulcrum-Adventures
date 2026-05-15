import Svg, { Path } from "react-native-svg";

export default function NoteIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14.5843 13.1571L10.7144 13.2856L10.8429 9.41567L17.2586 3L21 6.74141L14.5843 13.1571Z"
        stroke="#153A7A"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <Path
        d="M10.5986 4.28576H3.75868C3.65858 4.28402 3.55916 4.30245 3.46634 4.33995C3.37352 4.37746 3.2892 4.43327 3.21841 4.50406C3.14762 4.57485 3.09181 4.65917 3.05431 4.75199C3.0168 4.84481 2.99837 4.94423 3.00011 5.04432V20.2414C2.99837 20.3415 3.0168 20.4409 3.05431 20.5337C3.09181 20.6265 3.14762 20.7108 3.21841 20.7816C3.2892 20.8524 3.37352 20.9082 3.46634 20.9457C3.55916 20.9832 3.65858 21.0017 3.75868 20.9999H18.9557C19.0558 21.0017 19.1552 20.9832 19.2481 20.9457C19.3409 20.9082 19.4252 20.8524 19.496 20.7816C19.5668 20.7108 19.6226 20.6265 19.6601 20.5337C19.6976 20.4409 19.716 20.3415 19.7143 20.2414V13.4014"
        stroke="#153A7A"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path d="M7 13H9" stroke="#153A7A" strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M7 9H9" stroke="#153A7A" strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M7 17L16 17" stroke="#153A7A" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

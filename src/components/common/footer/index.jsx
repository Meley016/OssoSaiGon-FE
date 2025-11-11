import { useSettings } from "../../../contexts/useSetting";
import Above from "./Above";
import Between from "./Between";
import Under from "./Under";
export default function Footer() {
  
    const { language } = useSettings();
    return (
    <footer key={language} className="bg-black *:first-letter: text-white" >
      <div className="px-20">
        <div className= "py-12">
            <Above />
        </div>
        <Between />
      </div>
      <Under />
    </footer>
  );
}
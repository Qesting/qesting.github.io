import { StateFunctionsContext } from "./StateFunctionsContext";
import { useContext } from "react";
import PropTypes from 'prop-types';

function LinkButton({elementId, innerText, additionalClasses}) {
    const sectionStart = elementId.indexOf('-') + 1;
    const sectionEnd = elementId.startsWith('item') ? elementId.lastIndexOf('-') : undefined;
    const section = elementId.substring(sectionStart, sectionEnd);
    const setCurrentSection = useContext(StateFunctionsContext).setCurrentSection;
    const scrollFunction = section === 'footnote' 
        ? (() => document.querySelector(`#${elementId}`).scrollIntoView({ behavior: "smooth" }))
        : (() => {
            setCurrentSection(section.split('-')[0]);
            setTimeout(() => document.querySelector(`#${elementId}`).scrollIntoView({ behavior: "smooth" }), 100);
        })
    return (<button onClick={scrollFunction} className={["btn"].concat(additionalClasses).join(' ')}>{innerText}</button>)
}


LinkButton.propTypes = {
    elementId: PropTypes.string,
    innerText: PropTypes.string,
    additionalClasses: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.string),
        PropTypes.string
    ])
};

export default LinkButton;
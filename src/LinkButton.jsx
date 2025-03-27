import PropTypes from 'prop-types';
import { Link, useParams } from "react-router-dom";
import capitalize from './capitalize';
import isInView from './isInView';

function LinkButton({elementId, innerText, additionalClasses}) {
    const { sectionName } = useParams()
    const isFootnoteLink = elementId.startsWith("footnote")
    const sectionStart = elementId.indexOf('-') + 1;
    const sectionEnd = elementId.startsWith('item') ? elementId.lastIndexOf('-') : undefined;
    const section = elementId.substring(sectionStart, sectionEnd);
    const itemPos = isFootnoteLink ? sectionStart - 1 : elementId.lastIndexOf("-")
    const item = itemPos !== -1 ? elementId.substring(itemPos + 1) : null
    const scrollFunction = () => {
        if (!item) return
        const element = self.document.querySelector(`[id$="${item}"]`)
        self.document.activeElement.blur()
        if (!isInView(element)) element?.scrollIntoView({
            behavior: "smooth"
        })
        element?.focus()
    }

    const isSubSection = elementId.startsWith("section") && item !== section    

    return (
        isFootnoteLink || section === sectionName
            ? <button onClick={scrollFunction} className={["btn"].concat(additionalClasses).join(' ')}>{capitalize(innerText)}</button>
            : <Link to={"/" + section.split('-')[0] + (item && isSubSection ? `/>${item}` : item !== section ? `/${item}` : "")} className={["btn"].concat(additionalClasses).join(' ')}>{capitalize(innerText)}</Link>
        )
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
/**
 * @package moDatetimeField
 * @link https://github.com/moDevsome/moDatetimeField
 * @author Mickaël Outhier (original founder)
 * @version 1.0
 * @copyright 2022 Mickaël Outhier
 *
 * @license http://www.gnu.org/copyleft/lesser.html GNU Lesser General Public License
 * @note This program is distributed in the hope that it will be useful - WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.
 */

class moDateTimeField {

    constructor(DOMElement, options) {

        // Check the input DOM element
        if(typeof(DOMElement) !== "object") {

            console.error("moDatetimeField Error : The provided DOMElement must be a object.");
            return;

        }

        if(DOMElement.tagName !== "INPUT" || DOMElement.getAttribute("type") !== "text") {

            console.error("moDatetimeField Error : The provided DOMElement must be a valid input text field.");
            return;

        }

        this.DOMElementName = DOMElement.getAttribute("name");
        if(this.DOMElementName === null) {

            console.error("moDatetimeField Error : The provided DOMElement must have an attribute \"name.\"");
            return;

        }

        this.DOMElement = DOMElement;
        this.moDTFElement = document.createElement('div');
        this.fields = {}
        this.fieldsValueBackup = {}

        // Define default options
        this.type = "datetime"; // Avalable types : "datetime","date","time"
        this.inputFormat = "";
        this.outputFormat = "";
        this.fieldFormat = "local"; // The fields order in the html, by default we use the "toLocaleString" function to define the format
        this.hasCalendar = false; // TRUE to enable the calendar
        this.showCalendarButton = '<a href="#">Afficher le calendrier</a>';
        this.lang = navigator.language;

        if(typeof(options) === "object") {

            if(typeof(options.type) === "string" && ["datetime", "date", "time"].includes(options.type)) {

                this.type = options.type;

            }

            typeof(options.inputFormat) === "string" ? options.inputFormat : this.inputFormat;
            typeof(options.outputFormat) === "string" ? options.outputFormat : this.outputFormat;
            typeof(options.fieldFormat) === "string" ? options.fieldFormat : this.fieldFormat;
            typeof(options.hasCalendar) === "boolean" ? options.hasCalendar : this.hasCalendar;
            typeof(options.showCalendarButton) === "string" ? options.showCalendarButton : this.showCalendarButton;

        }

        // If input format is not provided, we set the default input format associeted with the type
        if(this.inputFormat.length === 0) {

            if(this.type === "date") {

                this.inputFormat = "Y-m-d";

            }
            else if(this.type === "time") {

                this.inputFormat = "H:i:s";

            }
            else { //datetime

                this.inputFormat = "Y-m-d H:i:s";

            }

        }

        // If output format is not provided, we set the default output format associeted with the type
        if(this.outputFormat.length === 0) {

            if(this.type === "date") {

                this.outputFormat = "Y-m-d";

            }
            else if(this.type === "time") {

                this.outputFormat = "H:i:s";

            }
            else { //datetime

                this.outputFormat = "Y-m-d H:i:s";

            }

        }

        this.monthList = {};
        if(this.type === "date" || this.type === "datetime") {

            // Create the month list by getting the name of each month
            let monthIteration = 0;
            while(monthIteration <= 11) {

                this.monthList[monthIteration] = new Date(2022, monthIteration, 1).toLocaleString(this.lang, { month: "long" });
                monthIteration++;

            }

        }

        this.dateObject = new Date();

    }
    addzerobefore(value) { // If a value is under 10, we add a 0 before

        let valueInt = parseInt(value);
        if(valueInt < 10) {

            return "0"+ valueInt.toString();

        }

        return valueInt.toString();

    }
    current(dateTimeDataID) { // Get a current value from the Date object

        let value = 0;
        switch(dateTimeDataID) {

            case "year" :
                value = this.dateObject.getFullYear();
                break;

            case "month" :
                value = this.dateObject.getMonth() + 1;
                break;

            case "day" :
                value = this.dateObject.getDate();
                break;

            case "hours" :
                value = this.dateObject.getHours();
                break;

            case "minutes" :
                value = this.dateObject.getMinutes();
                break;

            case "secondes" :
                value = this.dateObject.getSeconds();
                break;
        }

        return this.addzerobefore(value);

    }
    output() {

        let output = this.outputFormat;
        for(let [fieldKey, field] of Object.entries(this.fields)) {

            let stringValue = this.addzerobefore(field.value);

            switch(fieldKey) {

                case "year" :
                    output = output.replace("Y", stringValue);
                    output = output.replace("y", stringValue.length === 2 ? stringValue : stringValue.substring(2, 2));
                    break;

                case "month" :
                    output = output.replace("m", field.value);
                    break;

                case "day" :
                    output = output.replace("d", stringValue);
                    break;

                case "hours" :
                    output = output.replace("H", stringValue);
                    output = output.replace("h", stringValue);
                    break;

                case "minutes" :
                    output = output.replace("i", stringValue);
                    break;

                case "secondes" :
                    output = output.replace("s", stringValue);
                    break;

                default :
                    break;

            }

        }

        this.DOMElement.value = output;

    }
    render() {

        this.DOMElement.style.display = "none";
        let DOMElementClass = this.DOMElement.getAttribute("class");

        let dateDOMElementValueString = "";
        let timeDOMElementValueString = "";

        // Process the given value segments
        if(this.DOMElement.value !== "undefined") {

            if(this.type === "date") {

                dateDOMElementValueString = this.DOMElement.value.trim().replace(" ", "");

            }
            else if(this.type === "time") {

                timeDOMElementValueString = this.DOMElement.value.trim().replace(" ", "");

            }
            else {

                let DOMElementValueString = [];
                for(let DOMElementValueSegment of this.DOMElement.value.trim().split(" ")) {

                    if(DOMElementValueString.length === 2) {

                        break;

                    }
                    else {

                        if(DOMElementValueSegment.match("[0-9]")) {

                            DOMElementValueString.push(DOMElementValueSegment);

                        }

                    }

                }

                if(DOMElementValueString.length !== 2) {

                    console.error("moDatetimeField : Error while processing original datetime value. Field : \""+ this.DOMElementName +"\".\nCheck if the given value format match with the \"datetime\" format : \""+ this.inputFormat +"\".");
                    return;

                } else {

                    dateDOMElementValueString = DOMElementValueString[0];
                    timeDOMElementValueString = DOMElementValueString[1];

                }

            }

        }

        this.moDTFElement.classList.add('modatetime-field-wrapper');
        if(typeof(DOMElementClass) === "string" && DOMElementClass.length > 0) {

            this.moDTFElement.classList.add(" "+ DOMElementClass);

        }

        if(this.type === "date" || this.type === "datetime") {

            let formatDateSeparator = "/"; // Set the default date element separator
            let dateFieldsOrder = [];

            // Check and parse the HTML field format
            if(this.fieldFormat === "local") {

                let localFormatRef = this.dateObject.toLocaleDateString();
                formatDateSeparator = localFormatRef.match("/") ? "/" : "-";

                for(let segment of localFormatRef.split(formatDateSeparator)) {

                    if(segment === this.current("year")) {

                        dateFieldsOrder.push("year");

                    }

                    if(segment === this.current("month")) {

                        dateFieldsOrder.push("month");

                    }

                    if(segment === this.current("day")) {

                        dateFieldsOrder.push("day");

                    }

                }

            } else {

                // TODO: parse custom format

            }

            // Set the date value (Today by default)
            let dateDOMElementValue = {
                year: this.current("year"),
                month: this.current("month"),
                day: this.current("day")
            }

            // Parse the given date
            if(dateDOMElementValueString.length > 0) {

                try {

                    let dateDOMElementSeparator = this.inputFormat.match("/") ? "/" : "-";
                    let dateDOMElementValueSegments = dateDOMElementValueString.split(dateDOMElementSeparator);

                    let dateDOMElementFormatSegments = [];
                    if(this.type === "date") {

                        dateDOMElementFormatSegments = this.inputFormat.split(dateDOMElementSeparator);

                    }
                    else { // datetime

                        dateDOMElementFormatSegments = this.inputFormat.split(" ")[0].split(dateDOMElementSeparator);

                    }

                    if(dateDOMElementFormatSegments.length !== dateDOMElementValueSegments.length) {

                        console.error("moDatetimeField : Error while parsing original date value, the date format does not match with the inputFormat. Field : \""+ this.DOMElementName +"\"");
                        return;

                    }
                    else {

                        let segmentIteration = 0;
                        for(let valueSegment of dateDOMElementValueSegments) {

                            if(dateDOMElementFormatSegments[segmentIteration] === "Y" || dateDOMElementFormatSegments[segmentIteration] === "y") {

                                dateDOMElementValue.year = valueSegment;

                            }

                            if(dateDOMElementFormatSegments[segmentIteration] === "m") {

                                dateDOMElementValue.month = valueSegment;

                            }

                            if(dateDOMElementFormatSegments[segmentIteration] === "d") {

                                dateDOMElementValue.day = valueSegment;

                            }

                            segmentIteration++;

                        }

                    }

                }
                catch(error) {

                    console.error("moDatetimeField : Error while parsing original date value. Field : \""+ this.DOMElementName +"\"");
                    console.error(error.message);
                    return;

                }

            }

            for(let dateField of dateFieldsOrder) {

                if(dateField === "month") {

                    let field = document.createElement("select");
                    field.setAttribute("data-modatetimefield-fname", this.DOMElementName);
                    field.setAttribute("name", this.DOMElementName + "__modatetimefield_"+ dateField);
                    field.setAttribute("class", "modatetimefield_"+ dateField);

                    for(let [monthNum, monthName] of Object.entries(this.monthList)) {


                        let monthNumInt = parseInt(monthNum) + 1;

                        let option = document.createElement("option");
                        option.value = monthNumInt <= 9 ? "0"+ monthNumInt.toString() : monthNumInt.toString();
                        option.text = monthName;

                        if(option.value === dateDOMElementValue.month) {

                            this.fieldsValueBackup[dateField] = dateDOMElementValue[dateField];
                            option.selected = true;

                        }

                        field.appendChild(option);

                    }

                    // Set the event listener
                    field.addEventListener("change", () => {

                        // Checking the field
                        let intValue = parseInt(field.value);
                        if(!isNaN(intValue) && intValue > 0 && intValue < 13) {

                            // Check if date is valide
                            let testDateString = this.fields["year"].value +"-"+ this.fields["month"].value +"-"+ this.fields["day"].value;
                            if(!isNaN(Date.parse(testDateString))) {
                                this.fieldsValueBackup[dateField] = field.value;
                                this.output();
                            }
                            else {

                                console.warn("moDatetimeField : The provided value is not a valid date. Value : \""+ testDateString +"\"");
                                field.value = this.fieldsValueBackup[dateField];

                            }

                        }
                        else {

                            console.warn("moDatetimeField : The provided value is not a valid date. Value : \""+ testDateString +"\"");
                            field.value = this.fieldsValueBackup[dateField];

                        }

                    });

                    this.fields[dateField] = field;
                    this.moDTFElement.appendChild(field);

                }
                else {

                    let field = document.createElement("input");
                    field.setAttribute("data-modatetimefield-fname", this.DOMElementName);
                    field.setAttribute("name", this.DOMElementName + "__modatetimefield_"+ dateField);
                    field.setAttribute("class", "modatetimefield_"+ dateField);
                    field.value = dateDOMElementValue[dateField];
                    this.fieldsValueBackup[dateField] = dateDOMElementValue[dateField];

                    let inputMinLenght = dateField === "year" ? 4 : 1;

                    // Set the event listener
                    field.addEventListener("input", (inputEvent) => {

                        field.classList.remove("mo-datetime-field-error");

                        if(field.value.length === 0) { // The content of the field has been erased

                            field.classList.add("mo-datetime-field-error");
                            this.DOMElement.value = "";

                        }
                        else {

                            // We use a timer to check if the value is valid or not
                            window.setTimeout(() => {

                                if(field.value.length === 0 || field.value.length < inputMinLenght) { // The content of the field has been erased

                                    field.classList.add("mo-datetime-field-error");
                                    this.DOMElement.value = "";

                                } else {

                                    let yearValue = typeof(this.fields["year"].value) !== "undefined" ? this.addzerobefore(this.fields["year"].value) : "00";
                                    let monthValue = typeof(this.fields["month"].value) !== "undefined" ? this.addzerobefore(this.fields["month"].value) : "00";
                                    let dayValue = typeof(this.fields["day"].value) !== "undefined" ? this.addzerobefore(this.fields["day"].value) : "00";

                                    // Check if date is valide
                                    let testDateString = yearValue +"-"+ monthValue +"-"+ dayValue;
                                    if(!isNaN(Date.parse(testDateString))) {
                                        this.fieldsValueBackup[dateField] = field.value;
                                        this.output();
                                    }
                                    else {

                                        field.value = this.fieldsValueBackup[dateField];

                                    }

                                }

                            }, inputEvent.inputType === "deleteContentBackward" ? 1200 : 600);

                        }

                    });

                    this.fields[dateField] = field;
                    this.moDTFElement.appendChild(field);

                }

            }

        }

        if(this.type === "time" || this.type === "datetime") {

            let formatTimeSeparator = ":"; // Set the default time element separator
            let timeFieldsOrder = [];

            // Check and parse the HTML field format
            if(this.fieldFormat === "local") {

                let localFormatRef = this.dateObject.toLocaleTimeString();
                formatTimeSeparator = localFormatRef.match(":") ? ":" : "-";

                for(let segment of localFormatRef.split(formatTimeSeparator)) {

                    if(segment === this.current("hours")) {

                        timeFieldsOrder.push("hours");

                    }

                    if(segment === this.current("minutes")) {

                        timeFieldsOrder.push("minutes");

                    }

                    if(segment === this.current("secondes")) {

                        timeFieldsOrder.push("secondes");

                    }

                }

            } else {

                // TODO: parse custom format

            }

            // Set the time value (Now by default)
            let timeDOMElementValue = {
                hours: this.current("hours"),
                minutes: this.current("minutes"),
                secondes: this.current("secondes")
            }

            // Parse the given time
            if(this.DOMElement.value.length > 0) {

                try {

                    let timeDOMElementSeparator = this.inputFormat.match(":") ? ":" : "-";
                    let timeDOMElementValueSegments = timeDOMElementValueString.split(timeDOMElementSeparator);

                    let timeDOMElementFormatSegments = [];
                    if(this.type === "time") {

                        timeDOMElementFormatSegments = this.inputFormat.split(timeDOMElementSeparator);

                    }
                    else { // datetime

                        timeDOMElementFormatSegments = this.inputFormat.split(" ")[1].split(timeDOMElementSeparator);

                    }

                    if(timeDOMElementFormatSegments.length !== timeDOMElementValueSegments.length) {

                        console.error("moDatetimeField : Error while parsing original time value, the time format does not match with the inputFormat. Field : \""+ this.DOMElementName +"\"");
                        return;

                    }
                    else {

                        let segmentIteration = 0;
                        for(let valueSegment of timeDOMElementValueSegments) {

                            if(timeDOMElementFormatSegments[segmentIteration] === "H" || timeDOMElementFormatSegments[segmentIteration] === "h") {

                                timeDOMElementValue.hours = valueSegment;

                            }

                            if(timeDOMElementFormatSegments[segmentIteration] === "i") {

                                timeDOMElementValue.minutes = valueSegment;

                            }

                            if(timeDOMElementFormatSegments[segmentIteration] === "s") {

                                timeDOMElementValue.secondes = valueSegment;

                            }

                            segmentIteration++;

                        }

                    }

                }
                catch(error) {

                    console.error("moDatetimeField : Error while parsing original time value. Field : \""+ this.DOMElementName +"\"");
                    console.error(error.message);
                    return;

                }

            }

            for(let timeField of timeFieldsOrder) {

                let field = document.createElement("input");
                field.setAttribute("data-modatetimefield-fname", this.DOMElementName);
                field.setAttribute("name", this.DOMElementName + "__modatetimefield_"+ timeField);
                field.setAttribute("class", "modatetimefield_"+ timeField);
                field.value = timeDOMElementValue[timeField];
                this.fieldsValueBackup[timeField] = timeDOMElementValue[timeField];

                let inputMinLenght = 1;

                // Set the event listener
                field.addEventListener("input", (inputEvent) => {

                    field.classList.remove("mo-datetime-field-error");

                    if(field.value.length === 0) { // The content of the field has been erased

                        field.classList.add("mo-datetime-field-error");
                        this.DOMElement.value = "";

                    }
                    else {

                        // We use a timer to check if the value is valid or not
                        window.setTimeout(() => {

                            if(field.value.length === 0 || field.value.length < inputMinLenght) { // The content of the field has been erased

                                field.classList.add("mo-datetime-field-error");
                                this.DOMElement.value = "";

                            } else {

                                let hoursValue = typeof(this.fields["hours"].value) !== "undefined" ? this.addzerobefore(this.fields["hours"].value) : "00";
                                let minutesValue = typeof(this.fields["minutes"].value) !== "undefined" ? this.addzerobefore(this.fields["minutes"].value) : "00";
                                let secondesValue = typeof(this.fields["secondes"].value) !== "undefined" ? this.addzerobefore(this.fields["secondes"].value) : "00";

                                // Check if datetime is valide
                                let testDateString = this.current("year") +"-"+ this.current("month") +"-"+ this.current("day");
                                testDateString += " "+ hoursValue +":"+ minutesValue +":"+ secondesValue;
                                if(!isNaN(Date.parse(testDateString))) {
                                    this.fieldsValueBackup[timeField] = field.value;
                                    this.output();
                                }
                                else {

                                    console.warn("moDatetimeField : The provided value is not a valid datetime. Value : \""+ testDateString +"\"");
                                    field.value = this.fieldsValueBackup[timeField];

                                }

                            }

                        }, inputEvent.inputType === "deleteContentBackward" ? 1200 : 600);

                    }

                });

                this.fields[timeField] = field;
                this.moDTFElement.appendChild(field);

            }

        }

        this.DOMElement.parentElement.insertBefore(this.moDTFElement, this.DOMElement);

    }

}
const questionInputTypes = {
    radioButtonGroup : {
	    type: "radiogroup"
    },
    ratingScale : {
        type: "rating",
        rateTypes:{
            labels:"labels",
            stars:"stars",
            smileys:"smileys"
        }
    },
    slider : {
	    type:"slider"
    },
    checkboxes : {
	    type:"checkbox"
    },
    dropdown : {
	    type:"dropdown"
    },
    multiSelectDropdown : {
	    type:"tagbox"
    },
    yesNo : {
	    type:"boolean"
    },
    fileUpload : {
	    type:"file"
    },
    imagePicker : {
	    type:"imagepicker"
    },
    ranking : {
	    type:"ranking"
    },
    singleLineInput : {
        type:"text",
        inputTypes:{
            color:"color",
            date:"date",
            dateAndTime:"datetime-local",
            email:"email",
            month:"month",
            number:"number",
            password:"password",
            range:"range",
            phoneNumber:"tel",
            text:"text",
            time:"time",
            url:"url",
            week:"week"
        }
    },

    longText : {
	    type:"comment"
    },

    multipleTextboxes : {
	    type:"multipletext"
    },

    panel : {
	    type:"panel"
    },

    dynamicPanel : {
	    type:"paneldynamic"
    },

    singleSelectMatrix : {
	    type:"matrix"
    },

    multiSelectMatrix : {
	    type:"matrixdropdown"
    },

    dynamicMatrix : {
	    type:"matrixdynamic"
    },

    html : {
	    type:"html",
    },

    expression : {
	    type:"expression"
    },

    image : {
	    type: "image"
    },

    signature : {
	    type: "signaturepad"
    }
};

export default questionInputTypes;
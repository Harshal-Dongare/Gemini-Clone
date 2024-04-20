import { createContext, useState } from "react";
import runChat from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {
    // State to store input data provided by the user so we can pass it through     onSent() function.
    const [input, setInput] = useState("");

    // Stores the most recent user input query to display in the main component.
    const [recentPrompt, setRecentPrompt] = useState("");

    // Array to store the history of user prompts displayed in the left-side tab.
    const [previousPrompt, setPreviousPrompt] = useState([]);

    // Controls the visibility of default content in the main container; toggles to display results from resultData and hide default content.
    const [showResult, setShowResult] = useState(false);

    // Indicates whether loading animation should be displayed while waiting for server response.
    const [loading, setLoading] = useState(false);

    // State variable to display results on the web-page.
    const [resultData, setResultData] = useState("");

    // function to add typing effect to the result received from server
    const delayPara = (index, nextWord) => {
        setTimeout(function () {
            setResultData((prev) => prev + nextWord);
        }, 75 * index);
    };

    const newChat = () => {
        setLoading(false);
        setShowResult(false);
    };

    // a function that will be called when the user sends a prompt
    const onSent = async (prompt) => {
        // reset the previous result to empty string
        setResultData("");

        // setter function to activate the loading animation
        setLoading(true);

        setShowResult(true);

        let response;
        if (prompt !== undefined) {
            response = await runChat(prompt);
            setRecentPrompt(prompt);
        } else {
            setPreviousPrompt((prev) => [...prev, input]);
            setRecentPrompt(input);
            response = await runChat(input);
        }


        let responseToArray = response.split("**");
        let responseInBoldFormat = "";
        for (let i = 0; i < responseToArray.length; i++) {
            if (i === 0 || i % 2 !== 1) {
                responseInBoldFormat += responseToArray[i];
            } else {
                responseInBoldFormat += "<b>" + responseToArray[i] + "</b>";
            }
        }

        let addNewLineInResponse = responseInBoldFormat
            .split("*")
            .join("</br>");

        // update the response returned from the server and show it on the screen
        // setResultData(addNewLineInResponse);

        const typingEffectArray = addNewLineInResponse.split(" ");
        for (let index = 0; index < typingEffectArray.length; index++) {
            const nextWord = typingEffectArray[index];
            delayPara(index, nextWord + " ");
        }

        // once the response has been received, hide the loading animation
        setLoading(false);

        // to reset the input field
        setInput("");
    };

    const contextValue = {
        previousPrompt,
        setPreviousPrompt,
        onSent,
        setRecentPrompt,
        recentPrompt,
        showResult,
        loading,
        resultData,
        input,
        setInput,
        newChat,
    };

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    );
};

export default ContextProvider;

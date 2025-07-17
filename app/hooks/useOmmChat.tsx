import { useState, useCallback } from "react";
import { askOmmChat } from "@/utils/sse/sseRender";

interface UseOmmChatProps {
  threadId: string
  marketID: number
  scenarioID: string | undefined
  scenarioName?: string
  setScenarioID: (id: string) => void
}


const useOmmChat = ({ threadId, marketID, scenarioID, scenarioName, setScenarioID }: UseOmmChatProps) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [generatedDataframes, setGeneratedDataframes] = useState({});


  const parseSSEData = (data) => {

    const lines = data.split("\n");

    lines.forEach((line) => {

      if (line.startsWith("event: end") || line.startsWith("data: Connection closing")) {
        return;
      }


      if (line.startsWith("data: ")) {
        const jsonData = line.slice(6).trim();
        try {
          const parsedData = JSON.parse(jsonData);

          if (parsedData.messages) {
            setMessages(parsedData.messages);
          }
          if (parsedData.scenario_id) {
            setScenarioID(parsedData.scenario_id)
          }
          if (parsedData.generated_dataframes) {
            setGeneratedDataframes(parsedData.generated_dataframes);
          }
        } catch (e) {
          console.error("Error parsing JSON:", e);
        }
      }
    });
  };

  const sendMessage = useCallback(
    async (message: String) => {
      if (!scenarioID) {
        setError("Scenario ID is missing.");
        return;
      }
      setIsLoading(true);
      setError(null);

      try {
        const response = await askOmmChat(message, threadId, marketID, scenarioID, scenarioName);

        if (!response.ok) throw new Error("Failed to send message.");

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No readable stream available.");

        const decoder = new TextDecoder();
        let accumulatedData = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          accumulatedData += decoder.decode(value, { stream: true });

          try {
            parseSSEData(accumulatedData);
          } catch {
            console.log("Incomplete data, waiting for more chunks...");
          }
        }
      } catch (err) {
        setError("An error occurred while sending the message.");
        console.error("Error in useOmmChat:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [threadId, scenarioID]
  );

  return { messages, isLoading, error, generatedDataframes, sendMessage };
};

export default useOmmChat;

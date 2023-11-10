import React, { useState } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import ExcelUploader from "./ExcelUpload"; // Assurez-vous que ce composant est correctement importé
import logobnb from "./logo_bernabe.png";
import logotb from "./logo_technibat.png";
function App() {
  const [message, setMessage] = useState("");
  const [schedule, setSchedule] = useState({ date: "", time: "" });
  const [status, setStatus] = useState("");
  const [contactNumbers, setContactNumbers] = useState([]);
  const [invalidNumbers, setInvalidNumbers] = useState([]);

  const sendSMSBatch = async (batch) => {
    const validPrefixedNumbers = validateAndPrefixNumbers(batch);

    // Si aucun numéro valide, arrêter le traitement de ce lot
    if (validPrefixedNumbers.length === 0) {
      setStatus("Aucun numéro valide dans ce lot.");
      return;
    }

    const url = "messages";
    const data = new URLSearchParams({
      username: "bernabeci", // Remplacez par vos informations d'identification
      password: "Ad6Cxz9aGYpy", // Remplacez par vos informations d'identification
      msisdn: validPrefixedNumbers.join(","),
      msg: message,
      sender: "MrBRICOLAGE",
    });

    if (schedule.time !== "") {
      data.append("timetosend", schedule.time);
    }

    try {
      const response = await axios.post(url, data.toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      if (response.status === 200) {
        setStatus(`SMS envoyé avec succès au lot : ${response.data}`);
        console.log(response.data);
      } else {
        setStatus(
          `Échec de l'envoi du SMS. Code d'erreur : ${response.status}`
        );
        console.log("erreur ", response.data);
      }
    } catch (error) {
      setStatus(`Erreur lors de l'envoi des SMS : ${error}`);
      console.log("erreur ", error);
    }
    if (invalidNumbers.length > 0) {
      exportInvalidNumbers();
    }
  };

  const sendSMS = async () => {
    if (!message) {
      alert("Veuillez fournir tous les détails nécessaires.");
      return;
    }

    // Envoyer les SMS par lots de 500
    for (let i = 0; i < contactNumbers.length; i += 500) {
      const batch = contactNumbers.slice(i, i + 500);
      await sendSMSBatch(batch); // Vous pouvez ajouter une gestion d'erreur ici si nécessaire
      console.log("batch ", batch);
    }
    setStatus("Tous les SMS ont été planifiés pour envoi!");
  };

  const validateAndPrefixNumbers = (numbers) => {
    const validNumbers = [];
    const invalidNums = [];

    numbers.forEach((number) => {
      if (
        number.length === 10 &&
        (number.startsWith("01") ||
          number.startsWith("05") ||
          number.startsWith("07"))
      ) {
        validNumbers.push(`+225${number}`);
      } else {
        invalidNums.push(number);
      }
    });

    setInvalidNumbers((invalidNumbers) => [...invalidNumbers, ...invalidNums]);
    return validNumbers;
  };

  const exportInvalidNumbers = () => {
    const blob = new Blob([invalidNumbers.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(blob, "invalid_numbers.txt");
  };

  const handleScheduleChange = (field) => (e) => {
    setSchedule({ ...schedule, [field]: e.target.value });
  };

  let couleurTexte = "black";

  if (message.length > 160) {
    couleurTexte = "red";
  }

  const handleChange = (e) => {
    const message = e.target.value;
    setMessage(message);
  };
  return (
    <div className="App p-2 m-1">
      <h1>
        <img src={logobnb} alt="Logo BNB" width={70} height={65} />|
        <img src={logotb} alt="Logo TB" width={70} height={65} />
        SMS BERNABE
      </h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendSMS();
        }}
      >
        <textarea
          className="form-control mb-3"
          placeholder="Entrez votre message ici"
          cols={60}
          rows={10}
          value={message}
          onChange={handleChange}
          style={{ color: couleurTexte }}
        />
        <div
          className="d-flex justify-content-end mb-3"
          style={{ color: "GrayText" }}
        >
          {message.length}{" "}
          {message.length === 0 || message.length === 1
            ? "caractère"
            : "caractères"}
        </div>

        <div className="form-control m-2 mb-3">
          <ExcelUploader onContactsLoaded={setContactNumbers} />
        </div>
        <input
          type="date"
          className="form-control m-2 mb-3"
          value={schedule.date}
          onChange={handleScheduleChange("date")}
        />
        <input
          type="time"
          className="form-control m-2 mb-3"
          value={schedule.time}
          onChange={handleScheduleChange("time")}
        />
        <button className="btn btn-primary m-3 mb-3" type="submit">
          Planifier l'envoi
        </button>
        <div>{status}</div>
      </form>
    </div>
  );
}

export default App;

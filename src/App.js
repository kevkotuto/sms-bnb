
import React, { useState, useEffect } from "react";
import "./App.css";
import axios from 'axios';
import { saveAs } from 'file-saver';
import ExcelUploader from "./ExcelUpload";

function App() {
  const [message, setMessage] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [text, setText] = useState("");
  const [textRemaining, setTextRemaining] = useState(160);
  const [schedule, setSchedule] = useState({ date: "", time: "" });
  const [messageSent, setMessageSent] = useState(false);
  const [sender, setSender] = useState('');
  const [status, setStatus] = useState('');
  const [invalidNumbers, setInvalidNumbers] = useState([]);
  const [contactNumbers, setContactNumbers] = useState([]);

  const handleChangeText = (e) => {
    const inputText = e.target.value;
    setText(inputText);
    setTextRemaining(160 - inputText.length);
    setMessageSent(false);
    e.target.style.color = inputText.length > 160 ? "red" : "black";
  };

  const handleScheduleChange = (field) => (e) => {
    setSchedule({ ...schedule, [field]: e.target.value });
    setMessageSent(false);
  };

  const planSending = (e) => {
    e.preventDefault();
    const dateTime = `${schedule.date}T${schedule.time}`;
    setDateTimeToSend(dateTime);
  };

  const sendSMSBatch = async (batch) => {
    const validPrefixedNumbers = validateAndPrefixNumbers(batch);

    // Si aucun numéro valide, arrêter le traitement de ce lot
    if (validPrefixedNumbers.length === 0) {
      setStatus('Aucun numéro valide dans ce lot.');
      return;
    }

    const url = 'messages';
    const data = new URLSearchParams({
      username: 'bernabeci', // Remplacez par vos informations d'identification
      password: 'Ad6Cxz9aGYpy', // Remplacez par vos informations d'identification
      msisdn: validPrefixedNumbers.join(','),
      msg: message,
      sender: sender
    });

    if (scheduledTime !== '') {
      data.append('timetosend', scheduledTime);
    }

    try {
      const response = await axios.post(url, data.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (response.status === 200) {
        setStatus(`SMS envoyé avec succès au lot : ${response.data}`);
        console.log(response.data);
      } else {
        setStatus(`Échec de l'envoi du SMS. Code d'erreur : ${response.status}`);
        console.log('erreur ',response.data);
      }
    } catch (error) {
      setStatus(`Erreur lors de l'envoi des SMS : ${error}`);
      console.log('erreur ',error);
    }
    if (invalidNumbers.length > 0) {
      exportInvalidNumbers();
    }
  };

  const sendSMS = async () => {
    if (!message || !sender) {
      alert("Veuillez fournir tous les détails nécessaires.");
      return;
    }

    // Envoyer les SMS par lots de 500
    for (let i = 0; i < contactNumbers.length; i += 500) {
      const batch = contactNumbers.slice(i, i + 500);
      await sendSMSBatch(batch); // Vous pouvez ajouter une gestion d'erreur ici si nécessaire
      console.log('batch ',batch);
    }
    setStatus("Tous les SMS ont été planifiés pour envoi!");
  };

  useEffect(() => {
    // ... useEffect logic for sending messages based on the schedule
  }, [schedule, messageSent, text]);

  const validateAndPrefixNumbers = (numbers) => {
    const validNumbers = [];
    const invalidNums = [];

    numbers.forEach(number => {
      if (
        number.length === 10 &&
        (number.startsWith('01') || number.startsWith('05') || number.startsWith('07'))
      ) {
        validNumbers.push(`+225${number}`);
      } else {
        invalidNums.push(number);
      }
    });

    setInvalidNumbers(invalidNumbers => [...invalidNumbers, ...invalidNums]);
    return validNumbers;
  };

  const exportInvalidNumbers = () => {
    const blob = new Blob([invalidNumbers.join('\n')], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'invalid_numbers.txt');
  };

  return (
    <div className="App p-5">
      <h1>SMS BERNABE</h1>
      <form onSubmit={sendSMS}>
        <textarea
          className="form-control mb-3"
          placeholder="Enter your message here"
          cols={60}
          rows={10}
          value={text}
          onChange={handleChangeText}
        />
        <ExcelUploader onContactsLoaded={setContactNumbers} />
        <input
          type="date"
          className="form-control"
          value={schedule.date}
          onChange={handleScheduleChange('date')}
        />
        <input
          type="time"
          className="form-control"
          value={schedule.time}
          onChange={handleScheduleChange('time')}
        />
        <button className="btn btn-success m-3" type="submit">
          Schedule Send
        </button>
        {messageSent && (
          <p>Message scheduled for {schedule.date} at {schedule.time}</p>
        )}
      </form>
    </div>
  );
}

export default App;

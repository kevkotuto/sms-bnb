// SMSSender.js
import React, { useState } from 'react';
import axios from 'axios';
import './SMSSender.css';
import { saveAs } from 'file-saver';
function SMSSender({ contactNumbers }) {
  const [message, setMessage] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [sender, setSender] = useState('');
  const [status, setStatus] = useState('');
  const [invalidNumbers, setInvalidNumbers] = useState([]);
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

  return (
    <div className="sms-sender-container">
      <textarea
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <input
        type="datetime-local"
        value={scheduledTime}
        onChange={(e) => setScheduledTime(e.target.value)}
      />
      <input
        type="text"
        placeholder="Expéditeur"
        value={sender}
        onChange={(e) => setSender(e.target.value)}
      />
      <button onClick={sendSMS}>Planifier l'envoi des SMS</button>
      {status && <div>{status}</div>}
    </div>
  );
}

export default SMSSender;

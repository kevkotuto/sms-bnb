import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [texte, setTexte] = useState("");
  const [texteRest, setTexteRest] = useState(160);
  const [dateEnvoi, setDateEnvoi] = useState(""); // Date d'envoi
  const [heureEnvoi, setHeureEnvoi] = useState(""); // Heure d'envoi
  const [dateTimeEnvoi, setDateTimeEnvoi] = useState(""); // Date et heure d'envoi
  const [messageEnvoye, setMessageEnvoye] = useState(false);

  const handleChangeTexte = (e) => {
    setTexte(e.target.value);
    setMessageEnvoye(false);
  };

  const handleChangeDateEnvoi = (e) => {
    setDateEnvoi(e.target.value);
    setMessageEnvoye(false);
  };

  const handleChangeHeureEnvoi = (e) => {
    setHeureEnvoi(e.target.value);
    setMessageEnvoye(false);
  };

  const planifierEnvoi = (e) => {
    e.preventDefault(); // Empêcher le rechargement de la page

    if (dateEnvoi && heureEnvoi && texte) {
      const dateTime = `${dateEnvoi}T${heureEnvoi}`;
      setDateTimeEnvoi(dateTime);
    }
  };

  const verifierEnvoi = () => {
    const maintenant = new Date();
    const dateEnvoiComplet = new Date(dateTimeEnvoi);

    if (maintenant >= dateEnvoiComplet && texte) {
      setMessageEnvoye(true);
      console.log(`Message envoyé le ${dateEnvoi} à ${heureEnvoi}: ${texte}`);
    }
  };

  useEffect(() => {
    if (dateTimeEnvoi !== "" && !messageEnvoye) {
      const interval = setInterval(() => {
        verifierEnvoi();
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [dateTimeEnvoi, messageEnvoye, texte]);

  const handleChange = (e) => {
    const contenu = e.target.value;
    const nbreChar = 160 - contenu.length;
    setTexte(contenu);

    if (nbreChar < 0) {
      e.target.style.color = "red";
    } else {
      e.target.style.color = "black";
    }

    setTexteRest(nbreChar);
  };

  return (
    <div className="App p-5">
      <h1 className="">SMS BERNABE</h1>
      <form onSubmit={planifierEnvoi}>
        <textarea
          className="form-control mb-3"
          placeholder="Entrez le message à envoyer ici"
          cols={60}
          rows={10}
          value={texte}
          onChange={handleChange}
          style={{ color: texte.length > 160 ? "red" : "black" }}
        ></textarea>
        <label className="form-label" for="fichier">
          Liste des destinataires :
        </label>

        <input id="fichier" type="file" className="form-control"></input>
        <label className="form-label" for="date">
          Date d'envoi :
        </label>
        <input
          id="date"
          type="date"
          className="form-control"
          value={dateEnvoi}
          onChange={handleChangeDateEnvoi}
        />
        <label className="form-label" for="heure">
          Heure d'envoi :
        </label>
        <input
          id="heure"
          type="time"
          value={heureEnvoi}
          className="form-control"
          onChange={handleChangeHeureEnvoi}
        ></input>

        <button className="btn btn-success m-3" type="submit">
          Plannifier envoi
        </button>
        {/* <input
          type="submit"
          className="btn btn-primary"
          value={"Envoyer le message"}
        ></input> */}
        {dateTimeEnvoi && !messageEnvoye && (
          <p>Planification de l'envoi pour le {dateEnvoi} à {heureEnvoi}</p>
          // Message affiché lors de la planification de l'envoi avec la date et l'heure prévues
        )}
        {messageEnvoye && (
          <p>Message envoyé le {dateEnvoi} à {heureEnvoi}</p>
          // Message affiché une fois le message envoyé avec la date et l'heure d'envoi
        )}
      </form>
    </div>
  );
}

export default App;

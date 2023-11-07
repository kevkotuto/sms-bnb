import React, { useState } from 'react';
import * as XLSX from 'xlsx';

function ExcelUploader({ onContactsLoaded }) {
  const [items, setItems] = useState([]);

  const readExcel = (file) => {
    const promise = new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);

      fileReader.onload = (e) => {
        const bufferArray = e.target.result;

        const wb = XLSX.read(bufferArray, { type: 'buffer' });

        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        const data = XLSX.utils.sheet_to_json(ws);

        resolve(data);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });

    promise.then((d) => {
        setItems(d);
        onContactsLoaded(d.map(item => item.phoneNumber)); // Assurez-vous que vos données Excel ont un champ 'phoneNumber'
      });
  };

  return (
    <div>
      <input
        type="file"
        accept=".xlsx"
        onChange={(e) => {
          const file = e.target.files[0];
          readExcel(file);
        }}
      />
      <table>
        <thead>
          <tr>
            {items.length > 0 ? Object.keys(items[0]).map((key) => (
              <th key={key}>{key}</th>
            )) : null}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              {Object.values(item).map((val, index) => (
                <td key={index}>{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExcelUploader;

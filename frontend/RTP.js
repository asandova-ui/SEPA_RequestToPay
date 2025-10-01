// RTP.js

// Espera a que el DOM esté cargado y luego carga el contenido de RTP.html en el div "seccionRTP"
document.addEventListener("DOMContentLoaded", function() {
    fetch('RTP.html')
      .then(response => response.text())
      .then(html => {
        document.getElementById('seccionRTP').innerHTML = html;
        attachRTPEventListeners();
        if (!document.getElementById('seccionRTP').classList.contains('invisible-section')) {
          mostrarPanelRTPporRol();
        }
      })
      .catch(err => console.error('Error al cargar RTP.html:', err));
});

// Array para todas las notificaciones recibidas
let notificationsList = [];

// Función para ajustar la visibilidad de los paneles según el rol del usuario
function mostrarPanelRTPporRol() {
  const allRTPpanels = ['beneficiaryActions', 'pspBeneficiaryActions', 'pspPayerActions', 'payerActions'];
  allRTPpanels.forEach(p => {
    let elem = document.getElementById(p);
    if (elem) {
      elem.classList.add('invisible-section');
    }
  });
  
  if (currentActorRole === 'beneficiary') {
    document.getElementById('beneficiaryActions').classList.remove('invisible-section');
  } else if (currentActorRole === 'psp_beneficiary') {
    document.getElementById('pspBeneficiaryActions').classList.remove('invisible-section');
  } else if (currentActorRole === 'psp_payer') {
    document.getElementById('pspPayerActions').classList.remove('invisible-section');
  } else if (currentActorRole === 'payer') {
    document.getElementById('payerActions').classList.remove('invisible-section');
  }
}

// Registra todos los event listeners para los formularios y botones de la sección RTP
function attachRTPEventListeners() {
  // Beneficiary: Crear RTP
  const createRTPForm = document.getElementById('createRTPForm');
  if (createRTPForm) {
    createRTPForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const iban = document.getElementById('ibanField').value;
      const amount = parseFloat(document.getElementById('amountField').value);
  
      const data = {
        actor_id: currentActorId,
        payer_iban: iban,
        amount: amount
      };
  
      fetch('http://127.0.0.1:5000/rtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(r => r.json())
      .then(result => {
        const respDiv = document.getElementById('createRTPResponse');
        respDiv.classList.remove('invisible-section');
        respDiv.innerText = JSON.stringify(result, null, 2);
      })
      .catch(err => console.error(err));
    });
  }
  
  // PSP Beneficiary: Validar RTP
  const validateBeneficiaryForm = document.getElementById('validateBeneficiaryForm');
  if (validateBeneficiaryForm) {
    validateBeneficiaryForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const rtpId = document.getElementById('rtpIdValidateBene').value;
      const data = { actor_id: currentActorId };
  
      fetch(`http://127.0.0.1:5000/rtp/${rtpId}/validate-beneficiary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(r => r.json())
      .then(result => {
        const respDiv = document.getElementById('validateBeneficiaryResponse');
        respDiv.classList.remove('invisible-section');
        respDiv.innerText = JSON.stringify(result, null, 2);
      })
      .catch(err => console.error(err));
    });
  }
  
  // PSP Beneficiary: Enrutar RTP
  const routeForm = document.getElementById('routeForm');
  if (routeForm) {
    routeForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const rtpId = document.getElementById('rtpIdRoute').value;
      const data = { actor_id: currentActorId };
  
      fetch(`http://127.0.0.1:5000/rtp/${rtpId}/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(r => r.json())
      .then(result => {
        const respDiv = document.getElementById('routeResponse');
        respDiv.classList.remove('invisible-section');
        respDiv.innerText = JSON.stringify(result, null, 2);
      })
      .catch(err => console.error(err));
    });
  }
  
  // PSP Payer: Validar RTP
  const validatePayerForm = document.getElementById('validatePayerForm');
  if (validatePayerForm) {
    validatePayerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const rtpId = document.getElementById('rtpIdValidatePayer').value;
      const data = { actor_id: currentActorId };
  
      fetch(`http://127.0.0.1:5000/rtp/${rtpId}/validate-payer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(r => r.json())
      .then(result => {
        const respDiv = document.getElementById('validatePayerResponse');
        respDiv.classList.remove('invisible-section');
        respDiv.innerText = JSON.stringify(result, null, 2);
      })
      .catch(err => console.error(err));
    });
  }
  
  // Payer: Decidir RTP
  const decisionForm = document.getElementById('decisionForm');
  if (decisionForm) {
    decisionForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const rtpId = document.getElementById('rtpIdDecision').value;
      const decisionValue = document.getElementById('decision').value;
      const data = {
        actor_id: currentActorId,
        decision: decisionValue
      };
  
      fetch(`http://127.0.0.1:5000/rtp/${rtpId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(r => r.json())
      .then(result => {
        const respDiv = document.getElementById('decisionResponse');
        respDiv.classList.remove('invisible-section');
        respDiv.innerText = JSON.stringify(result, null, 2);
      })
      .catch(err => console.error(err));
    });
  }
  
  // Mostrar Logs
  const showLogsBtn = document.getElementById('showLogs');
  if (showLogsBtn) {
    showLogsBtn.addEventListener('click', () => {
      fetch('http://127.0.0.1:5000/logs')
      .then(r => r.json())
      .then(logs => {
        let html = `<ul class="list-group">`;
        logs.forEach(l => {
          html += `<li class="list-group-item">
            <strong>RTP ${l.rtp_id}:</strong> ${l.old_status} ⇒ ${l.new_status}
            <small> (${l.timestamp})</small>
          </li>`;
        });
        html += `</ul>`;
        document.getElementById('logsResponse').innerHTML = html;
      })
      .catch(err => console.error(err));
    });
  }
  
  // -- LISTENERS de SOCKET.IO: quitamos setTimeout y almacenamos en notificationsList --

  // Añade notificación a la lista y vuelve a renderizar la tabla
  function addNotificationToList(rtpData) {
    // rtpData => {id, amount, status, ...}
    notificationsList.push(rtpData);
    renderNotificationsTable();
  }

  // Renderiza la tabla con las notificaciones
  function renderNotificationsTable() {
    const tableBody = document.querySelector('#notificationsTable tbody');
    tableBody.innerHTML = ''; // Limpia
    notificationsList.forEach((rtp) => {
      const row = document.createElement('tr');

      // ID
      const tdId = document.createElement('td');
      tdId.textContent = rtp.id;
      row.appendChild(tdId);

      // Monto
      const tdMonto = document.createElement('td');
      tdMonto.textContent = rtp.amount;
      row.appendChild(tdMonto);

      // Status
      const tdStatus = document.createElement('td');
      tdStatus.textContent = rtp.status;
      row.appendChild(tdStatus);

      // Acciones (botón)
      const tdAction = document.createElement('td');
      // Dependiendo del rol, la acción varía:
      if (currentActorRole === 'psp_beneficiary') {
        // p.ej. un botón "Validar" o "Enrutar" si procede
        // Comprobaremos su status para ver qué acción es adecuada
        if (rtp.status === 'creado') {
          let btnVal = document.createElement('button');
          btnVal.className = 'btn btn-sm btn-warning me-2';
          btnVal.textContent = 'Validar';
          btnVal.onclick = () => doValidateBeneficiary(rtp.id);
          tdAction.appendChild(btnVal);
        }
        if (rtp.status === 'creado' || rtp.status === 'validado-beneficiario') {
          let btnRoute = document.createElement('button');
          btnRoute.className = 'btn btn-sm btn-warning';
          btnRoute.textContent = 'Enrutar';
          btnRoute.onclick = () => doRoute(rtp.id);
          tdAction.appendChild(btnRoute);
        }
      }
      else if (currentActorRole === 'psp_payer') {
        if (rtp.status === 'enrutado') {
          let btnVal2 = document.createElement('button');
          btnVal2.className = 'btn btn-sm btn-info';
          btnVal2.textContent = 'Validar';
          btnVal2.onclick = () => doValidatePayer(rtp.id);
          tdAction.appendChild(btnVal2);
        }
      }
      else if (currentActorRole === 'payer') {
        // Muestra un botón para 'decidir' si la status es 'validado_payer'
        if (rtp.status === 'validado_payer') {
          let btnDecisionA = document.createElement('button');
          btnDecisionA.className = 'btn btn-sm btn-success me-2';
          btnDecisionA.textContent = 'Aceptar';
          btnDecisionA.onclick = () => doDecision(rtp.id, 'aceptado');
          tdAction.appendChild(btnDecisionA);

          let btnDecisionR = document.createElement('button');
          btnDecisionR.className = 'btn btn-sm btn-danger';
          btnDecisionR.textContent = 'Rechazar';
          btnDecisionR.onclick = () => doDecision(rtp.id, 'rechazado');
          tdAction.appendChild(btnDecisionR);
        }
      }
      else if (currentActorRole === 'beneficiary') {
        // Podríamos mostrar info, en principio no hay acción
      }

      row.appendChild(tdAction);
      tableBody.appendChild(row);
    });
  }

  // Funciones que ejecutan las acciones sin necesidad de un formulario manual
  function doValidateBeneficiary(rtpId) {
    const data = { actor_id: currentActorId };
    fetch(`http://127.0.0.1:5000/rtp/${rtpId}/validate-beneficiary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(r=>r.json())
    .then(resp=>{
      console.log('ValidarBenefic resp:', resp);
    })
    .catch(err=>console.error(err));
  }
  function doRoute(rtpId) {
    const data = { actor_id: currentActorId };
    fetch(`http://127.0.0.1:5000/rtp/${rtpId}/route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(r=>r.json())
    .then(resp=>{
      console.log('Route resp:', resp);
    })
    .catch(err=>console.error(err));
  }
  function doValidatePayer(rtpId) {
    const data = { actor_id: currentActorId };
    fetch(`http://127.0.0.1:5000/rtp/${rtpId}/validate-payer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(r=>r.json())
    .then(resp=>{
      console.log('ValidatePayer resp:', resp);
    })
    .catch(err=>console.error(err));
  }
  function doDecision(rtpId, decisionValue) {
    const data = {
      actor_id: currentActorId,
      decision: decisionValue
    };
    fetch(`http://127.0.0.1:5000/rtp/${rtpId}/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(r=>r.json())
    .then(resp=>{
      console.log('Decision resp:', resp);
    })
    .catch(err=>console.error(err));
  }

  // --- Socket listeners: en vez de notificación temporal, almacenamos en la lista ---

  // Para psp_beneficiary cuando se crea un RTP
  socket.on('rtp_created', function(data) {
    if (currentActorRole === 'psp_beneficiary') {
      addNotificationToList(data);
    }
  });

  // Para psp_payer cuando se enruta el RTP
  socket.on('rtp_routed', function(data) {
    if (currentActorRole === 'psp_payer') {
      addNotificationToList(data);
    }
  });

  // Para payer cuando el PSP payer valida
  socket.on('rtp_validated_payer', function(data) {
    if (currentActorRole === 'payer') {
      addNotificationToList(data);
    }
  });

  // Para beneficiary cuando el pagador decide
  socket.on('rtp_decision', function(data) {
    if (currentActorRole === 'beneficiary') {
      addNotificationToList(data);
    }
  });
}

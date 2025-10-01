/* app.js */

let currentActorId = null;
let currentActorRole = null;

// Inicializar la conexión Socket.IO
const socket = io.connect('http://127.0.0.1:5000');

/** LOGIN */
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  fetch('http://127.0.0.1:5000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      document.getElementById('loginError').classList.remove('invisible-section');
      document.getElementById('loginError').innerText = data.error;
      return;
    }
    currentActorId = data.actor_id;
    currentActorRole = data.role;

    // Emitir 'join' para unirse a la sala correspondiente
    socket.emit('join', { actor_id: currentActorId });

    // Oculta la sección de login y muestra el contenido
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('bankContent').classList.remove('invisible-section');
    document.getElementById('mainNavbar').style.display = 'block';

    // Mostrar info en la navbar
    document.getElementById('navbarUserInfo').innerText = data.name + " (" + data.role + ")";
    
    // Cargar la vista principal
    mostrarSeccion('homeDashboard', true);
  })
  .catch(err => console.error(err));
});

/** Función para mostrar secciones */
function mostrarSeccion(sectionId, reloadHome=false) {
  const secciones = ['homeDashboard', 'seccionCuentas', 'seccionTarjetas', 'seccionPerfil', 'seccionRTP'];
  secciones.forEach(s => {
    document.getElementById(s).classList.add('invisible-section');
  });

  document.getElementById(sectionId).classList.remove('invisible-section');
  
  if (sectionId === 'homeDashboard' && reloadHome) {
    cargarHomeDashboard();
  }
  if (sectionId === 'seccionPerfil') {
    cargarPerfil();
  }
  // Agregamos la llamada cuando se muestra la sección RTP
  if (sectionId === 'seccionRTP') {
    mostrarPanelRTPporRol();
  }
  
  // Control del menú inferior
  const bottomMenu = document.getElementById('bottomMenuSquares');
  if (sectionId === 'homeDashboard') {
    const navbarCollapse = document.getElementById('navbarNav');
    if (navbarCollapse.classList.contains('show')) {
      bottomMenu.style.display = 'none';
    } else {
      bottomMenu.style.display = 'flex';
    }
  } else {
    bottomMenu.style.display = 'none';
  }
}

/** cargarHomeDashboard */
function cargarHomeDashboard() {
  fetch(`http://127.0.0.1:5000/profile/${currentActorId}`)
  .then(r => r.json())
  .then(data => {
    if (data.error) {
      console.error("Error al cargar homeDashboard:", data.error);
      return;
    }
    // Formatear el balance
    let balance = data.balance != null ? data.balance : 0;
    let balanceTxt = formatMoney(balance);
    document.getElementById('homeBalanceDisplay').innerText = balanceTxt;

    // IBAN
    let ibanTxt = data.iban ? formatIBAN(data.iban) : 'empty';
    document.getElementById('homeIbanDisplay').innerText = ibanTxt;

    // Nombre
    let nameTxt = data.name ? data.name : 'empty';
    document.getElementById('homeNameDisplay').innerText = nameTxt;

    // Foto
    const homePhoto = document.getElementById('homePhoto');
    if (data.photo_url) {
      homePhoto.src = data.photo_url;
      homePhoto.style.display = 'inline';
    } else {
      homePhoto.style.display = 'none';
    }

    // Ajustar fuente del balance (para números muy grandes)
    adjustFontSize('homeBalanceDisplay', 'balance-circle');

    // Si es payer, mostrar mensaje extra
    const payerMsg = document.getElementById('payerExtraMsg');
    if (currentActorRole === 'payer') {
      payerMsg.classList.remove('invisible-section');
      payerMsg.textContent = "¡Hola! Como payer, aquí puedes gestionar tus solicitudes de pago.";
    } else {
      payerMsg.classList.add('invisible-section');
    }
  })
  .catch(err => console.error(err));
}

/** Formatear dinero con puntos y coma */
function formatMoney(value) {
  let parts = value.toFixed(2).split('.');
  let integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  let decimalPart = parts[1];
  return integerPart + ',' + decimalPart + ' €';
}

/** Formatear IBAN */
function formatIBAN(iban) {
  return iban.replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim();
}

/** Ajustar tamaño de fuente dinamicamente para que no se salga del círculo */
function adjustFontSize(elementId, containerId) {
  const element = document.getElementById(elementId);
  const container = document.getElementById(containerId);
  let fontSize = 2.5;
  element.style.fontSize = fontSize + 'rem';
  
  while (
    (element.scrollWidth > container.clientWidth || element.scrollHeight > container.clientHeight) 
    && fontSize > 0.4
  ) {
    fontSize -= 0.1;
    element.style.fontSize = fontSize + 'rem';
  }
}

/** cargarPerfil */
function cargarPerfil() {
  fetch(`http://127.0.0.1:5000/profile/${currentActorId}`)
  .then(r => r.json())
  .then(data => {
    if (data.error) {
      console.error("Error al cargar perfil:", data.error);
      return;
    }
    const photo = document.getElementById('profilePhoto');
    if (data.photo_url) {
      photo.src = data.photo_url;
      photo.style.display = 'inline';
    } else {
      photo.style.display = 'none';
    }
    document.getElementById('profileIban').innerText = data.iban || '(sin IBAN)';
    document.getElementById('profileBalance').innerText = data.balance != null ? data.balance : 0;
    document.getElementById('editPhoto').value = data.photo_url || '';
    document.getElementById('editIban').value = data.iban || '';
    document.getElementById('editBalance').value = data.balance != null ? data.balance : 0;
  })
  .catch(err => console.error(err));
}

/** Actualizar perfil */
document.getElementById('profileEditForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const newPhoto = document.getElementById('editPhoto').value;
  const newIban = document.getElementById('editIban').value;
  const newBal = parseFloat(document.getElementById('editBalance').value);

  const data = {
    actor_id: currentActorId,
    photo_url: newPhoto,
    iban: newIban,
    balance: newBal
  };

  fetch('http://127.0.0.1:5000/profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  .then(r => r.json())
  .then(resp => {
    const msgDiv = document.getElementById('profileMsg');
    msgDiv.classList.remove('invisible-section');
    if (resp.error) {
      msgDiv.innerText = resp.error;
    } else {
      msgDiv.innerText = "Perfil actualizado correctamente";
      cargarPerfil();
    }
  })
  .catch(err => console.error(err));
});

/* Controlar visibilidad del menú inferior al expandir/contraer navbar */
document.addEventListener('shown.bs.collapse', function(e) {
  if(e.target.id === "navbarNav") {
    const bottomMenu = document.getElementById('bottomMenuSquares');
    if (!document.getElementById('homeDashboard').classList.contains('invisible-section')) {
      bottomMenu.style.display = 'none';
    }
  }
});
document.addEventListener('hidden.bs.collapse', function(e) {
  if(e.target.id === "navbarNav") {
    const bottomMenu = document.getElementById('bottomMenuSquares');
    if (!document.getElementById('homeDashboard').classList.contains('invisible-section')) {
      bottomMenu.style.display = 'flex';
    }
  }
});

# 🎨 FABIO PINTURAS — Sistema Inteligente de Dictado de Fórmulas por Voz

Aplicación especializada para el almacén y laboratorio de pinturas **FABIO PINTURAS**. Permite a los técnicos y coloristas de taller dictar fórmulas de pintura con manos libres, cambiar de color al instante en tiempo real y guardar todo en una base de datos persistente.

---

## 🚀 Inicio Rápido

1. Abre tu terminal en la carpeta del proyecto:
   ```bash
   cd C:\Users\Alfre\.gemini\antigravity\scratch\fabio-pinturas
   ```

2. Inicia el servidor local:
   ```bash
   npm start
   ```
   *(O directamente con Node sin instalar nada: `node server.js`)*

3. Abre en tu navegador (Google Chrome o Microsoft Edge recomendado para el micrófono):
   ```
   http://localhost:3000
   ```

*(Si deseas usar una tablet o teléfono móvil en la cabina de mezcla, simplemente ingresa la IP local de tu computador, por ejemplo `http://192.168.1.50:3000`).*

---

## 🎙️ Funcionalidades Principales

### 1. Cambio Dinámico de Color al Instante
Durante el dictado, si mencionas el nombre o código de otro color, la aplicación:
- **Si ya existe en la base de datos**: Carga de inmediato la fórmula con todos sus componentes, cantidades y notas.
- **Si es un color nuevo**: Inicializa de inmediato una nueva fórmula con ese nombre y código lista para recibir pigmentos.

**Ejemplos de comandos de voz:**
- *"Cambiar a Rojo Ferrari"*
- *"Color Blanco Glaciar código 204"*
- *"Pasar a código ROS-322"*
- *"Ahora Azul Metálico"*

### 2. Dictado Fluido de Pigmentos y Componentes
Reconoce cantidades en números y palabras en español, asociando automáticamente códigos de pigmentos y proporciones porcentuales:
- *"Agregar Negro Humo 45 gramos"*
- *"Blanco Titanio 120"*
- *"Poner Amarillo Óxido 15 punto 5 gramos"*
- *"Añadir Thinner Acrílico 50 mililitros"*
- *"Cambiar Negro Humo a 50 gramos"* (edición dinámica sin borrar)
- *"Quitar último componente"* o *"Eliminar Amarillo"*

### 3. Guardado en Base de Datos Persistente
- Guarda con el comando de voz: *"Guardar fórmula"* o con el atajo de teclado `Ctrl + S`.
- **Doble Redundancia**: Se guarda tanto en el disco duro local (`data/formulas.json`) como en la base de datos del navegador (**IndexedDB**), permitiendo copias de seguridad y exportación en JSON.

### 4. Calculadora de Escala para Taller
Calcula en tiempo real las cantidades exactas para diferentes volúmenes sin modificar la fórmula original:
- *"Calcular el doble"* (Multiplica x2)
- *"Calcular para 1 galón"*
- Botones rápidos: Base (100%), ½ Mitad, x2, x3, ¼ Galón, Muestra 100g.

### 5. Lectura de Fórmula por Voz (Asistente Auditivo)
Con el comando *"Leer fórmula"*, el asistente de voz dicta en voz alta cada uno de los componentes y sus gramajes para que el preparador pueda verificar el pesaje en la báscula sin mirar la pantalla.

### 6. Impresión de Ficha Técnica / Ticket de Mezcla
Genera una orden de formulación profesional con fecha, cliente, vehículo, códigos, porcentajes y espacio de firmas para el colorista y el cliente.

---

## ⌨️ Atajos Rápidos de Teclado
- **Barra Espaciadora**: Activar / Desactivar micrófono (Modo manos libres).
- **Ctrl + S**: Guardar fórmula activa en la base de datos.
- **Enter en cantidad**: Añadir componente rápidamente.

---

## 📁 Estructura del Proyecto
```
fabio-pinturas/
├── data/
│   └── formulas.json       # Base de datos persistente en disco
├── public/
│   ├── css/
│   │   └── styles.css      # Estilos de taller de alto contraste
│   ├── js/
│   │   ├── app.js          # Controlador principal de la UI
│   │   ├── audio-effects.js# Efectos sonoros y visualizador de ondas
│   │   ├── db.js           # Gestor de base de datos (REST + IndexedDB)
│   │   └── voice-engine.js # Motor NLP de voz y reconocimiento en español
│   └── index.html          # Interfaz de usuario de 3 paneles
├── package.json
├── server.js               # Servidor HTTP nativo en Node.js
└── README.md
```

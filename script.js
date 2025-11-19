// SafeNotes - Secure Note-Taking JavaScript

// Theme management
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.querySelector('.theme-toggle');

    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        themeToggle.textContent = '🌙 Dark Mode';
    } else {
        body.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️ Light Mode';
    }
}

// Load saved theme (modified for artifact environment)
function loadSavedTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.textContent = '🌙 Dark Mode';
    }
}

// Tab management
function showTab(tabName) {
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });

    const targetTab = document.getElementById(tabName);
    if (targetTab) {
        targetTab.classList.add('active');
    }

    if (event && event.target) {
        event.target.classList.add('active');
    }
}

// Toast notification system
let activeToasts = []; 

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    
    activeToasts.push(toast);

    
    const toastHeight = 60; 
    const toastSpacing = 10; 
    const topOffset = 20; 

    const position = topOffset + (activeToasts.length - 1) * (toastHeight + toastSpacing);
    toast.style.top = `${position}px`;

    document.body.appendChild(toast);

    
    setTimeout(() => toast.classList.add('show'), 100);

    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);


                const index = activeToasts.indexOf(toast);
                if (index > -1) {
                    activeToasts.splice(index, 1);
                }

                repositionToasts();
            }
        }, 300);
    }, 3000);
}

function repositionToasts() {
    const toastHeight = 60;
    const toastSpacing = 10;
    const topOffset = 20;

    activeToasts.forEach((toast, index) => {
        if (document.body.contains(toast)) {
            const newPosition = topOffset + index * (toastHeight + toastSpacing);
            toast.style.top = `${newPosition}px`;
        }
    });
}

// Password strength checker
function checkPasswordStrength(password) {
    const strengthBar = document.getElementById('passwordBar');
    const strengthText = document.getElementById('passwordText');

    if (!strengthBar || !strengthText) return;

    let score = 0;
    let feedback = '';

    if (password.length >= 8) score++;
    if (password.match(/[a-z]/)) score++;
    if (password.match(/[A-Z]/)) score++;
    if (password.match(/[0-9]/)) score++;
    if (password.match(/[^a-zA-Z0-9]/)) score++;

    strengthBar.className = 'password-strength-bar';

    if (score === 0) {
        strengthBar.classList.add('strength-weak');
        feedback = 'Enter a password';
    } else if (score <= 2) {
        strengthBar.classList.add('strength-weak');
        feedback = 'Weak password';
    } else if (score === 3) {
        strengthBar.classList.add('strength-fair');
        feedback = 'Fair password';
    } else if (score === 4) {
        strengthBar.classList.add('strength-good');
        feedback = 'Good password';
    } else {
        strengthBar.classList.add('strength-strong');
        feedback = 'Strong password';
    }

    strengthText.textContent = feedback;
}

// Encryption functions
function encryptNote() {
    const title = document.getElementById('noteTitle')?.value || '';
    const content = document.getElementById('noteContent')?.value || '';
    const password = document.getElementById('encryptPassword')?.value || '';

    if (!title.trim() || !content.trim()) {
        showToast('Please enter both title and content', 'error');
        return;
    }

    if (!password) {
        showToast('Please enter a password', 'error');
        return;
    }

    try {
        const noteData = JSON.stringify({
            title: title.trim(),
            content: content.trim(),
            timestamp: new Date().toISOString()
        });

        // Encrypt using AES
        const encrypted = CryptoJS.AES.encrypt(noteData, password).toString();

        const resultElement = document.getElementById('encryptedResult');
        if (resultElement) {
            resultElement.textContent = encrypted;
        }
        showToast('Note encrypted successfully!', 'success');

        saveRecentNote(title, encrypted);

    } catch (error) {
        showToast('Encryption failed: ' + error.message, 'error');
    }
}

function decryptNote() {
    const encrypted = document.getElementById('encryptedInput')?.value || '';
    const password = document.getElementById('decryptPassword')?.value || '';

    if (!encrypted.trim()) {
        showToast('Please enter encrypted text', 'error');
        return;
    }

    if (!password) {
        showToast('Please enter a password', 'error');
        return;
    }

    try {
        // Decrypt using AES
        const decryptedBytes = CryptoJS.AES.decrypt(encrypted, password);
        const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

        if (!decryptedText) {
            throw new Error('Invalid password or corrupted data');
        }

        // Parse the decrypted JSON
        const noteData = JSON.parse(decryptedText);

        const result = `Title: ${noteData.title}\n\nContent:\n${noteData.content}\n\nCreated: ${new Date(noteData.timestamp).toLocaleString()}`;

        const resultElement = document.getElementById('decryptedResult');
        if (resultElement) {
            resultElement.textContent = result;
        }
        showToast('Note decrypted successfully!', 'success');

    } catch (error) {
        showToast('Decryption failed: Wrong password or invalid data', 'error');
        const resultElement = document.getElementById('decryptedResult');
        if (resultElement) {
            resultElement.textContent = 'Decryption failed. Please check your password and try again.';
        }
    }
}

// Utility functions for steganography
function stringToBinary(str) {
    return str.split('').map(char => {
        return char.charCodeAt(0).toString(2).padStart(8, '0');
    }).join('');
}

function binaryToString(binary) {
    let result = '';
    try {
        for (let i = 0; i < binary.length; i += 8) {
            const byte = binary.slice(i, i + 8);
            if (byte.length === 8) {
                const charCode = parseInt(byte, 2);
                if (charCode === 0) break; // Stop at null character
                result += String.fromCharCode(charCode);
            }
        }
    } catch (error) {
        console.error('Binary to string conversion error:', error);
        return '';
    }
    return result;
}

// Enhanced image format validation
function isValidImageFormat(fileType) {
    return fileType === 'image/png' || fileType === 'image/jpeg' || fileType === 'image/jpg';
}

function getImageFormatName(fileType) {
    switch (fileType) {
        case 'image/png':
            return 'PNG';
        case 'image/jpeg':
        case 'image/jpg':
            return 'JPG';
        default:
            return 'Unknown';
    }
}

// Enhanced steganography functions with PNG/JPG support
function handleImageUpload(input) {
    const file = input.files[0];
    if (!file) return;

    if (!isValidImageFormat(file.type)) {
        showToast('Please upload a PNG or JPG image', 'error');
        return;
    }

    if (file.type !== 'image/png') {
        showToast('For best results, please use PNG images', 'warning');
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const img = document.getElementById('imagePreview');
        if (img) {
            img.src = e.target.result;
            img.style.display = 'block';

            img.dataset.fileType = file.type;

            showToast(`${getImageFormatName(file.type)} image loaded successfully!`, 'success');

            img.onload = function () {
                const canvas = document.getElementById('originalCanvas');
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    const hideBtn = document.getElementById('hideBtn');
                    if (hideBtn) {
                        hideBtn.disabled = false;
                    }
                }
            };
        }
    };
    reader.readAsDataURL(file);
}

function handleExtractImageUpload(input) {
    const file = input.files[0];
    if (!file) return;

    if (!isValidImageFormat(file.type)) {
        showToast('Please upload a PNG or JPG image', 'error');
        return;
    }

    // Recommend PNG for better extraction results
    if (file.type !== 'image/png') {
        showToast('For best extraction results, please use PNG images', 'warning');
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const img = document.getElementById('extractImagePreview');
        if (img) {
            img.src = e.target.result;
            img.style.display = 'block';

            img.dataset.fileType = file.type;

            showToast(`${getImageFormatName(file.type)} image loaded for extraction!`, 'success');

            // Load image into canvas
            img.onload = function () {
                const canvas = document.getElementById('extractCanvas');
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    const extractBtn = document.getElementById('extractBtn');
                    if (extractBtn) {
                        extractBtn.disabled = false;
                    }
                }
            };
        }
    };
    reader.readAsDataURL(file);
}

function hideMessageInImage() {
    const title = document.getElementById('stegoTitle')?.value || '';
    const content = document.getElementById('stegoContent')?.value || '';
    const password = document.getElementById('stegoPassword')?.value || '';

    if (!title.trim() || !content.trim()) {
        showToast('Please enter both title and content', 'error');
        return;
    }

    if (!password) {
        showToast('Please enter a password', 'error');
        return;
    }

    try {
        const noteData = JSON.stringify({
            title: title.trim(),
            content: content.trim(),
            timestamp: new Date().toISOString()
        });

        // Encrypt the note
        const encrypted = CryptoJS.AES.encrypt(noteData, password).toString();

        const binaryMessage = stringToBinary(encrypted) + '1111111111111110'; 

        const originalCanvas = document.getElementById('originalCanvas');
        if (!originalCanvas) {
            showToast('No image loaded', 'error');
            return;
        }

        const originalCtx = originalCanvas.getContext('2d');
        const imageData = originalCtx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);

        if (binaryMessage.length > imageData.data.length / 4 * 3) { // Only RGB channels
            showToast('Image too small for this message', 'error');
            return;
        }

        // Hide message in image using LSB steganography (FIXED)
        let messageIndex = 0;
        const newImageData = new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);

        for (let i = 0; i < newImageData.data.length && messageIndex < binaryMessage.length; i++) {
            if (i % 4 !== 3) {
                if (messageIndex < binaryMessage.length) {
                    newImageData.data[i] = (newImageData.data[i] & 0xFE) | parseInt(binaryMessage[messageIndex]);
                    messageIndex++;
                }
            }
        }

        // Draw modified image to stego canvas
        const stegoCanvas = document.getElementById('stegoCanvas');
        if (stegoCanvas) {
            const stegoCtx = stegoCanvas.getContext('2d');
            stegoCanvas.width = originalCanvas.width;
            stegoCanvas.height = originalCanvas.height;
            stegoCtx.putImageData(newImageData, 0, 0);

            const downloadBtn = document.getElementById('downloadCanvasBtn');
            if (downloadBtn) {
                downloadBtn.disabled = false;
            }
        }

        showToast('Message hidden in image successfully!', 'success');

    } catch (error) {
        showToast('Steganography failed: ' + error.message, 'error');
    }
}

function extractMessageFromImage() {
    const password = document.getElementById('extractPassword')?.value || '';

    if (!password) {
        showToast('Please enter a password', 'error');
        return;
    }

    try {
        const canvas = document.getElementById('extractCanvas');
        if (!canvas) {
            showToast('No image loaded', 'error');
            return;
        }

        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Extract binary message from LSB of RGB channels (FIXED)
        let binaryMessage = '';
        const endMarker = '1111111111111110';

        for (let i = 0; i < imageData.data.length; i++) {
            if (i % 4 !== 3) {
                binaryMessage += (imageData.data[i] & 1).toString();

                if (binaryMessage.length >= 16 && binaryMessage.length % 8 === 0) {
                    if (binaryMessage.slice(-16) === endMarker) {
                        binaryMessage = binaryMessage.slice(0, -16);
                        break;
                    }
                }

                if (binaryMessage.length > imageData.data.length) {
                    break;
                }
            }
        }

        if (!binaryMessage || binaryMessage.length === 0) {
            throw new Error('No hidden message found or invalid image');
        }

        const encrypted = binaryToString(binaryMessage);

        if (!encrypted) {
            throw new Error('Could not decode binary message');
        }

        // Decrypt the message
        const decryptedBytes = CryptoJS.AES.decrypt(encrypted, password);
        const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

        if (!decryptedText) {
            throw new Error('Invalid password or no hidden message');
        }

        const noteData = JSON.parse(decryptedText);

        const result = `Title: ${noteData.title}\n\nContent:\n${noteData.content}\n\nCreated: ${new Date(noteData.timestamp).toLocaleString()}`;

        const resultElement = document.getElementById('extractedResult');
        if (resultElement) {
            resultElement.textContent = result;
        }
        showToast('Message extracted successfully!', 'success');

    } catch (error) {
        console.error('Extraction error:', error);
        showToast('Extraction failed: Wrong password or no hidden message', 'error');
        const resultElement = document.getElementById('extractedResult');
        if (resultElement) {
            resultElement.textContent = 'Extraction failed. Please check your password and ensure the image contains a hidden message.';
        }
    }
}
// Utility functions
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const text = element.textContent;

    if (!text.trim() || text.includes('will appear here') || text.includes('failed')) {
        showToast('Nothing to copy', 'error');
        return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Copied to clipboard!', 'success');
        }).catch(() => {
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

function fallbackCopyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('Copied to clipboard!', 'success');
}

function downloadText(elementId, filename) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const text = element.textContent;

    if (!text.trim() || text.includes('will appear here') || text.includes('failed')) {
        showToast('Nothing to download', 'error');
        return;
    }

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('File downloaded!', 'success');
}

// Fixed download function to always use PNG format
function downloadCanvas() {
    const canvas = document.getElementById('stegoCanvas');

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
        showToast('No image to download', 'error');
        return;
    }

    const format = 'image/png';
    const filename = 'stego-image.png';

    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('Stego image downloaded as PNG!', 'success');
    }, format);
}

// Form clearing functions
function clearEncryptForm() {
    const titleEl = document.getElementById('noteTitle');
    const contentEl = document.getElementById('noteContent');
    const passwordEl = document.getElementById('encryptPassword');
    const resultEl = document.getElementById('encryptedResult');

    if (titleEl) titleEl.value = '';
    if (contentEl) contentEl.value = '';
    if (passwordEl) passwordEl.value = '';
    if (resultEl) resultEl.textContent = 'Your encrypted note will appear here...';

    checkPasswordStrength('');
}

function clearDecryptForm() {
    const inputEl = document.getElementById('encryptedInput');
    const passwordEl = document.getElementById('decryptPassword');
    const resultEl = document.getElementById('decryptedResult');

    if (inputEl) inputEl.value = '';
    if (passwordEl) passwordEl.value = '';
    if (resultEl) resultEl.textContent = 'Your decrypted note will appear here...';
}

function clearStegoForm() {
    const titleEl = document.getElementById('stegoTitle');
    const contentEl = document.getElementById('stegoContent');
    const passwordEl = document.getElementById('stegoPassword');
    const uploadEl = document.getElementById('imageUpload');
    const previewEl = document.getElementById('imagePreview');
    const hideBtnEl = document.getElementById('hideBtn');
    const downloadBtnEl = document.getElementById('downloadCanvasBtn');

    if (titleEl) titleEl.value = '';
    if (contentEl) contentEl.value = '';
    if (passwordEl) passwordEl.value = '';
    if (uploadEl) uploadEl.value = '';
    if (previewEl) {
        previewEl.style.display = 'none';
        delete previewEl.dataset.fileType; // Clear stored file type
    }
    if (hideBtnEl) hideBtnEl.disabled = true;
    if (downloadBtnEl) downloadBtnEl.disabled = true;

    const stegoCanvas = document.getElementById('stegoCanvas');
    if (stegoCanvas) {
        const stegoCtx = stegoCanvas.getContext('2d');
        stegoCtx.clearRect(0, 0, stegoCanvas.width, stegoCanvas.height);
        stegoCanvas.width = 0;
        stegoCanvas.height = 0;
    }
}

function clearExtractForm() {
    const passwordEl = document.getElementById('extractPassword');
    const uploadEl = document.getElementById('extractImageUpload');
    const previewEl = document.getElementById('extractImagePreview');
    const btnEl = document.getElementById('extractBtn');
    const resultEl = document.getElementById('extractedResult');

    if (passwordEl) passwordEl.value = '';
    if (uploadEl) uploadEl.value = '';
    if (previewEl) {
        previewEl.style.display = 'none';
        delete previewEl.dataset.fileType; 
    }
    if (btnEl) btnEl.disabled = true;
    if (resultEl) resultEl.textContent = 'Your extracted message will appear here...';
}

let recentNotesMemory = [];

function saveRecentNote(title, encrypted) {
    try {
        recentNotesMemory.unshift({
            title: title,
            encrypted: encrypted.substring(0, 50) + '...', // Store only preview
            timestamp: new Date().toISOString()
        });

        recentNotesMemory = recentNotesMemory.slice(0, 5);

    } catch (error) {
        console.log('Could not save to memory:', error);
    }
}

// Security functions
function clearSensitiveData() {
    document.querySelectorAll('input[type="password"]').forEach(input => {
        input.value = '';
    });
    document.querySelectorAll('textarea').forEach(textarea => {
        if (textarea.id.includes('encrypted') || textarea.id.includes('decrypt')) {
            textarea.value = '';
        }
    });

    recentNotesMemory = [];
}

// Inactivity management
let inactivityTimer;
const INACTIVITY_TIME = 300000; // 5 minutes

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        if (confirm('Clear all data due to inactivity?')) {
            clearEncryptForm();
            clearDecryptForm();
            clearStegoForm();
            clearExtractForm();
            showToast('Data cleared due to inactivity', 'info');
        }
    }, INACTIVITY_TIME);
}

// Event listeners setup
function setupEventListeners() {
    const encryptPasswordEl = document.getElementById('encryptPassword');
    if (encryptPasswordEl) {
        encryptPasswordEl.addEventListener('input', (e) => {
            checkPasswordStrength(e.target.value);
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case '1':
                    e.preventDefault();
                    showTab('encrypt');
                    const tab1 = document.querySelector('.tab');
                    if (tab1) tab1.click();
                    break;
                case '2':
                    e.preventDefault();
                    showTab('decrypt');
                    const tab2 = document.querySelectorAll('.tab')[1];
                    if (tab2) tab2.click();
                    break;
                case '3':
                    e.preventDefault();
                    showTab('steganography');
                    const tab3 = document.querySelectorAll('.tab')[2];
                    if (tab3) tab3.click();
                    break;
                case '4':
                    e.preventDefault();
                    showTab('extract');
                    const tab4 = document.querySelectorAll('.tab')[3];
                    if (tab4) tab4.click();
                    break;
            }
        }
    });

 
    const fileUploads = document.querySelectorAll('.file-upload');
    fileUploads.forEach(upload => {
        const input = upload.querySelector('input[type="file"]');
        const label = upload.querySelector('.file-upload-label');

        if (!input || !label) return;

        upload.addEventListener('dragover', (e) => {
            e.preventDefault();
            label.style.borderColor = 'var(--primary)';
            label.style.background = 'var(--bg)';
        });

        upload.addEventListener('dragleave', (e) => {
            e.preventDefault();
            label.style.borderColor = 'var(--border)';
            label.style.background = 'var(--surface)';
        });

        upload.addEventListener('drop', (e) => {
            e.preventDefault();
            label.style.borderColor = 'var(--border)';
            label.style.background = 'var(--surface)';

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (isValidImageFormat(file.type)) {
                    input.files = files;
                    input.dispatchEvent(new Event('change'));
                } else {
                    showToast('Please drop a PNG or JPG image', 'error');
                }
            }
        });
    });


    window.addEventListener('beforeunload', clearSensitiveData);


    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetInactivityTimer, true);
    });
}


function initializeSafeNotes() {

    loadSavedTheme();
  
    setupEventListeners();
 
    resetInactivityTimer();
   
    showToast('Welcome to SafeNotes! 🔐 Use PNG images for best steganography results!', 'info');
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSafeNotes);
} else {
    initializeSafeNotes();
}

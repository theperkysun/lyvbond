// Base URL for the API
export const BASE_URL = 'http://10.112.158.195:5000/api';

// API Endpoints                                                                                                                                                                                                                          
export const API_ENDPOINTS = {
    // Auth
    LOGIN: '/auth/login',
    REGISTER: '/signup/register',

    // Inbox
    INBOX_RECEIVED: '/inbox/received',
    INBOX_SENT: '/inbox/sent',
    INBOX_ACCEPTED: '/inbox/accepted',
    INBOX_CONTACTS: '/inbox/contacts',

    // Inbox Actions
    INBOX_ACCEPT: '/inbox/accept',
    INBOX_REJECT: '/inbox/reject',
    INBOX_REMIND: '/inbox/remind',
    INBOX_CANCEL: '/inbox/cancel',

    // User
    USER_PROFILE: '/user/profile',
    USER_UPDATE: '/user/update',
    USER_IMAGE_UPLOAD: '/user/profile/image',
    USER_BLOCK: '/user/block',
    USER_UNBLOCK: '/user/unblock',

    // Chat
    CHAT_LIST: '/chat/list',
    CHAT_MESSAGES: '/chat', // /chat/:id/messages
    CHAT_START: '/chat/start',
    CHAT_IMAGE_UPLOAD: '/user/chat/image',

    // Calls
    CALL_HISTORY: '/calls/history',
};

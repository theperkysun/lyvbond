export const HELP_CATEGORIES = [
    {
        id: '1',
        title: 'Account',
        iconName: 'account-cog-outline',
        iconType: 'MaterialCommunityIcons',
        description: 'Login, settings, password',
        faqs: [
            { id: 'a1', question: 'How do I reset my password?', answer: 'Go to the Login screen and tap "Forgot Password". Follow the instructions sent to your email/phone.' },
            { id: 'a2', question: 'How do I change my phone number?', answer: 'Navigate to Account Settings > Contact Privacy to update your registered phone number.' },
            { id: 'a3', question: 'How can I deactivate my account?', answer: 'You can hide or delete your profile from Account Settings > Hide / Delete Profile.' },
        ]
    },
    {
        id: '2',
        title: 'Profile',
        iconName: 'user-edit',
        iconType: 'FontAwesome5',
        description: 'Photos, bio, details',
        faqs: [
            { id: 'p1', question: 'How do I edit my profile?', answer: 'Go to your Profile page and click the "Edit" (pencil) icon on the specific section you wish to change.' },
            { id: 'p2', question: 'Why was my photo rejected?', answer: 'Photos must strictly follow our guidelines: consistent lighting, clear face, no watermarks, and appropriate attire.' },
            { id: 'p3', question: 'Can I hide my profile from search?', answer: 'Yes, go to Privacy Settings to control your profile visibility.' },
        ]
    },
    {
        id: '3',
        title: 'Privacy',
        iconName: 'lock-closed-outline',
        iconType: 'Ionicons',
        description: 'Visibility, blocking',
        faqs: [
            { id: 'pr1', question: 'Who can see my contact details?', answer: 'Only members you have accepted or paid members (depending on your settings) can view your contact details.' },
            { id: 'pr2', question: 'How do I block a user?', answer: 'Visit the user\'s profile, tap the menu (three dots), and select "Block this Profile".' },
            { id: 'pr3', question: 'What happens when I report someone?', answer: 'Our safety team investigates the report typically within 24 hours. Your identity remains confidential.' },
        ]
    },
    {
        id: '4',
        title: 'Membership',
        iconName: 'crown-outline',
        iconType: 'MaterialCommunityIcons',
        description: 'Plans, payments',
        faqs: [
            { id: 'm1', question: 'What are the benefits of Premium?', answer: 'Premium members can chat unlimitedly, view contact numbers, and get better visibility in search results.' },
            { id: 'm2', question: 'How do I renew my membership?', answer: 'Go to the "Upgrade" or "Membership" section in the menu to view and select a renewal plan.' },
            { id: 'm3', question: 'Can I get a refund?', answer: 'Refunds are processed according to our Refund Policy. Please contact support for specific cases.' },
        ]
    },
    {
        id: '5',
        title: 'Matches',
        iconName: 'user-friends',
        iconType: 'FontAwesome5',
        description: 'Connecting, chat',
        faqs: [
            { id: 'ma1', question: 'How do I get more matches?', answer: 'Complete your profile 100%, upload high-quality photos, and verify your details to get more interest.' },
            { id: 'ma2', question: 'What is a Super Like?', answer: 'A Super Like lets a user know you are extremely interested. They get a special notification.' },
            { id: 'ma3', question: 'Where can I see who visited my profile?', answer: 'Check the "Recent Visitors" section on your dashboard.' },
        ]
    },
    {
        id: '6',
        title: 'Safety',
        iconName: 'security',
        iconType: 'MaterialIcons',
        description: 'Reporting, guides',
        faqs: [
            { id: 's1', question: 'Is LyvBond safe?', answer: 'Yes, we use AI-powered screening, manual verification, and strict privacy controls to ensure your safety.' },
            { id: 's2', question: 'How to safe online?', answer: 'Read our "Safety Tips" section for detailed guidelines on safe online dating practices.' },
            { id: 's3', question: 'What is the Safety Centre?', answer: 'It represents our commitment to user safety, offering resources, tips, and reporting tools.' },
        ]
    },
];

export const POPULAR_FAQS = [
    { id: 'a2', question: 'How do I change my phone number?', answer: 'Navigate to Account Settings > Contact Privacy to update.' },
    { id: 'a3', question: 'How to delete my profile?', answer: 'Navigate to Account Settings > Hide / Delete Profile.' },
    { id: 'p3', question: 'Is my photo visible to everyone?', answer: 'Check your Privacy Settings to manage photo visibility.' },
    { id: 'm1', question: 'What are benefits of Premium?', answer: 'Unlimited chat, view contacts, and better visibility.' },
];

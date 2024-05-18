document.getElementById('confirm-age').addEventListener('click', function() {
    document.getElementById('age-verification').style.display = 'none';
    document.getElementById('content').classList.add('active');
});

document.getElementById('deny-age').addEventListener('click', function() {
    window.location.href = 'https://www.google.com';
});

document.getElementById('add-bot-btn').addEventListener('click', function() {
    window.location.href = 'https://discord.com/oauth2/authorize?client_id=1201207793676468224&permissions=2048&response_type=code&redirect_uri=https%3A%2F%2Fdiscordapp.com%2Foauth2%2Fauthorize%3F%26client_id%3D1201207793676468224%26scope%3Dbot%2Bapplications.commands%2Bmessages.read%2Bapplications.commands.permissions.update&scope=applications.commands.permissions.update+applications.commands+messages.read+bot';
});

   function redirectToGameMode() {
        const select = document.getElementById('mode');
        const selectedValue = select.value;
        if (selectedValue) {
            window.location.href = selectedValue;
        }
    }
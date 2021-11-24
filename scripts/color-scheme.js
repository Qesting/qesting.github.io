var themetoggle = x => localStorage.theme =
+document.body.classList.toggle( "dark", x == +localStorage.theme );
themetoggle(1);
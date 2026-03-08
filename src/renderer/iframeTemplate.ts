export const iframeTemplate = `
<!DOCTYPE html>
<html>
    <head>
        <style>
            html, body {
                margin:0;
                padding:0;
                min-height:100vh;
                box-sizing:border-box;
                font-family:sans-serif;
            }

            * {
                margin:0;
                padding:0;
                box-sizing:border-box;
            }

            body {
                background:white;
            }

            [data-node-id] {
                position: relative;
            }
        </style>
    </head>
    <body></body>
</html>
`

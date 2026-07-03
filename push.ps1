Add-Content -Path .gitignore -Value "`n.env`n.env.local"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/juventudelivredb-ux/landingpage-juventudelivre.git
git push -u origin main

document.addEventListener('DOMContentLoaded', () => {

    const githubUsername = 'helyio-dev';

    async function fetchGitHubData() {
        const githubContentDiv = document.getElementById('github-content');
        const githubReposCountElement = document.getElementById('github-repos-count');
        const githubFollowersCountElement = document.getElementById('github-followers-count');

        if (githubUsername === 'votre-nom-utilisateur-github' || !githubUsername || githubUsername.trim() === '') {
            githubContentDiv.innerHTML = `
                <div class="github-placeholder">
                    <i class="fab fa-github github-icon-placeholder"></i>
                    <p>Accès au journal des opérations.<br>Données en attente de configuration.</p>
                </div>
            `;
            if (githubReposCountElement) {
                githubReposCountElement.setAttribute('data-target', '0');
                animateCount(githubReposCountElement);
            }
            if (githubFollowersCountElement) {
                githubFollowersCountElement.setAttribute('data-target', '0');
                animateCount(githubFollowersCountElement);
            }
            return;
        }

        githubContentDiv.innerHTML = '<p class="loading-message-hud">Récupération des logs en cours...</p>';

        try {
            const reposResponse = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&direction=desc&per_page=2`);
            if (!reposResponse.ok) {
                throw new Error(`Erreur HTTP repos: ${reposResponse.status} - ${reposResponse.statusText}`);
            }
            const repos = await reposResponse.json();
            const publicRepos = repos.filter(repo => !repo.private);

            if (publicRepos.length > 0) {
                githubContentDiv.innerHTML = '';
                publicRepos.forEach(repo => {
                    const repoCard = `
                        <a href="${repo.html_url}" target="_blank" class="github-repo-card-hud">
                            <h4>${repo.name}</h4>
                            <p>${repo.description || 'Fichier log corrompu. Aucune description.'}</p>
                            <div class="repo-meta-hud">
                                ${repo.language ? `<span><i class="fas fa-code"></i> ${repo.language}</span>` : ''}
                                <span><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
                                <span><i class="fas fa-calendar-alt"></i> ${new Date(repo.updated_at).toLocaleDateString('fr-FR')}</span>
                            </div>
                        </a>
                    `;
                    githubContentDiv.innerHTML += repoCard;
                });
            } else {
                githubContentDiv.innerHTML = '<p class="loading-message-hud">Aucun log d\'opération récent disponible.</p>';
            }

            const userResponse = await fetch(`https://api.github.com/users/${githubUsername}`);
            if (!userResponse.ok) {
                throw new Error(`Erreur HTTP user: ${userResponse.status} - ${userResponse.statusText}`);
            }
            const userData = await userResponse.json();
            const publicRepoCount = userData.public_repos;
            const followersCount = userData.followers;

            if (githubReposCountElement) {
                githubReposCountElement.setAttribute('data-target', publicRepoCount);
                animateCount(githubReposCountElement);
            }
            
            if (githubFollowersCountElement) {
                githubFollowersCountElement.setAttribute('data-target', followersCount);
                animateCount(githubFollowersCountElement);
            }

        } catch (error) {
            githubContentDiv.innerHTML = '<p class="loading-message-hud error-message">Erreur : Connexion au journal impossible. Vérifiez votre configuration.</p>';
            
            if (githubReposCountElement) {
                githubReposCountElement.setAttribute('data-target', '0');
                animateCount(githubReposCountElement);
            }
            if (githubFollowersCountElement) {
                githubFollowersCountElement.setAttribute('data-target', '0');
                animateCount(githubFollowersCountElement);
            }
        }
    }

    fetchGitHubData();

    const animateCount = (element) => {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000;
        const start = 0;
        let startTime = null;

        const easeOutQuad = (t) => t * (2 - t);

        const step = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = (currentTime - startTime) / duration;
            const easedProgress = easeOutQuad(progress);

            const currentValue = Math.floor(easedProgress * (target - start) + start);
            element.textContent = currentValue.toLocaleString('fr-FR');
            
            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                element.textContent = target.toLocaleString('fr-FR');
            }
        };

        if (element.dataset.animationFrame) {
            cancelAnimationFrame(parseInt(element.dataset.animationFrame));
        }
        element.dataset.animationFrame = requestAnimationFrame(step);
    };
    
    const glitchPanels = document.querySelectorAll('.hud-panel');

    glitchPanels.forEach(panel => {
        let timeoutId;

        panel.setAttribute('data-glitch-text', panel.textContent);

        panel.addEventListener('mouseenter', () => {
            clearTimeout(timeoutId);
            panel.classList.add('glitch-active');
            timeoutId = setTimeout(() => {
                panel.classList.remove('glitch-active');
            }, 3000);
        });
    });
});
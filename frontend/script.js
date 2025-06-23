document.addEventListener('DOMContentLoaded', function() {
    const drinkForm = document.getElementById('drinkForm');
    const drinksContainer = document.getElementById('drinksContainer');
    let editingId = null;

    function fetchDrinks() {
        fetch('http://localhost:5000/api/drinks')
            .then(response => response.json())
            .then(data => renderDrinks(data));
    }

    function renderDrinks(drinks) {
        drinksContainer.innerHTML = '';
        drinks.forEach(drink => {
            const drinkElement = document.createElement('div');
            drinkElement.className = `drink-item ${drink.kolicina < drink.minimalna_kolicina ? 'low-stock' : ''}`;
            
            drinkElement.innerHTML = `
                <div class="drink-info">
                    <h5>${drink.naziv}</h5>
                    <div class="details">
                        <span class="badge bg-secondary">${drink.kategorija}</span>
                        <span>Cijena: ${drink.cijena.toFixed(2)} kn</span>
                        <span class="${drink.kolicina < drink.minimalna_kolicina ? 'alert-stock' : ''}">
                            Zalihe: ${drink.kolicina}/${drink.minimalna_kolicina}
                        </span>
                    </div>
                </div>
                <div class="drink-actions">
                    <button class="btn btn-primary btn-sm" onclick='editDrink(${JSON.stringify(drink)})'>
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteDrink(${drink.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;
            drinksContainer.appendChild(drinkElement);
        });
    }

    window.deleteDrink = function(id) {
        if (confirm('Jeste li sigurni da želite obrisati ovo piće?')) {
            fetch(`http://localhost:5000/api/drinks/${id}`, {
                method: 'DELETE'
            })
            .then(() => fetchDrinks());
        }
    };

    window.editDrink = function(drink) {
        editingId = drink.id;
        document.getElementById('naziv').value = drink.naziv;
        document.getElementById('kategorija').value = drink.kategorija;
        document.getElementById('cijena').value = drink.cijena;
        document.getElementById('kolicina').value = drink.kolicina;
        document.getElementById('minimalna_kolicina').value = drink.minimalna_kolicina;

        const submitBtn = drinkForm.querySelector('button[type="submit"]');
        submitBtn.innerHTML = `<i class="bi bi-save"></i> Ažuriraj`;
        submitBtn.classList.remove('btn-success');
        submitBtn.classList.add('btn-warning');
    };

    drinkForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = {
            naziv: document.getElementById('naziv').value,
            kategorija: document.getElementById('kategorija').value,
            cijena: parseFloat(document.getElementById('cijena').value),
            kolicina: parseInt(document.getElementById('kolicina').value),
            minimalna_kolicina: parseInt(document.getElementById('minimalna_kolicina').value)
        };

        const url = editingId
            ? `http://localhost:5000/api/drinks/${editingId}`
            : 'http://localhost:5000/api/drinks';
        const method = editingId ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(() => {
            drinkForm.reset();
            editingId = null;
            const submitBtn = drinkForm.querySelector('button[type="submit"]');
            submitBtn.innerHTML = `<i class="bi bi-caret-down-fill"></i> Spremi`;
            submitBtn.classList.remove('btn-warning');
            submitBtn.classList.add('btn-success');
            fetchDrinks();
        });
    });

    fetchDrinks();
});

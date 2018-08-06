import Svg from './svg';
import Request from './lib/request';
import { makeElement, removeElement, removeChildren, isElementInDom } from './lib/dom';

class ResultsTable {
    constructor(wrapper) {
        this.wrapper = wrapper;

        this.prepareTable();
        this.preparePagination();

        this.wrapper.addEventListener('click', e => this.clickHandler(e));
    }

    destroy() {
        if (isElementInDom(this.wrapper)) {
            removeElement(this.wrapper);
        }
        this.wrapper = null;
    }

    clickHandler(event) {
        let target = event.target;
        let action;

        while (target.parentNode && target !== event.currentTarget) {
            action = target.dataset.click;

            if (action) break;
            target = target.parentNode;
        }

        action = target.dataset.click;

        if (action && this[action]) {
            this[action](event.target, event);
        }
    }

    prepareTable() {
        this.container = makeElement('div', 'table');
    }

    preparePagination() {
        this.pagination = makeElement('div', 'tablePagination');
    }

    getTable(data) {
        this.fillTable(data);
        return this.container;
    }

    getPagination(current, max) {
        this.fillPagination(current, max);
        return this.pagination;
    }

    loadFromButton(button) {
        let page = button.dataset ? parseInt(button.dataset.page) : 1;
        this.load(page);
    }

    load(page) {
        let url = null;

        if (page && typeof page === 'number') {
            url = '/special/genius/results/page/' + page;
        } else {
            url = '/special/genius/results/me';
        }

        this.wrapper.classList.add('state--loading');

        Request(url, 'GET').then(response => {
            response = JSON.parse(response);

            let table = this.getTable(response);
            let pagination = this.getPagination(response[0].current_page, response[0].last_page);

            this.wrapper.appendChild(table);
            this.wrapper.appendChild(pagination);

            this.wrapper.classList.remove('state--loading');
        });
    }

    fillTableHeader() {
        let header = makeElement('div', 'table__header');
        this.container.appendChild(header);

        this.fillRow(header, ['Место', '', 'Имя', 'Расстояние']);
    }

    fillTable(data) {
        removeChildren(this.container);

        this.fillTableHeader();

        data.forEach(item => {
            let row = makeElement('div', 'table__row');
            let icon = parseInt(item.rank) <= 10 ? Svg.star : '';

            if (item.is_me) {
                row.classList.add('state--active');
            }

            this.container.appendChild(row);
            this.fillRow(row, [
                item.rank, icon, item.name, item.score + '&nbsp;м'
            ]);
        });
    }

    fillPagination(current, max) {
        removeChildren(this.pagination);

        if (max > 1) {
            for (let i = 1; i <= max; i++){
                let button = makeElement('div', 'tablePagination__item', {
                    textContent: i,
                    data: {
                        click: 'loadFromButton',
                        page: i
                    }
                });

                if (i === current) {
                    button.classList.add('state--active');
                }

                this.pagination.appendChild(button);
            }
        }
    }

    fillRow(row, data) {
        data.forEach(item => {
            let cell = makeElement('div', 'table__cell', {
                innerHTML: item
            });

            row.appendChild(cell);
        });
    }
}

export default ResultsTable;
import Svg from './svg';
import { makeElement } from './lib/dom';

class ResultsTable {
    constructor() {
        this.prepareTable();
        this.preparePagination();
    }

    prepareTable() {
        this.container = makeElement('div', 'table');

        let header = makeElement('div', 'table__header');
        this.container.appendChild(header);

        this.fillRow(header, ['Место', '', 'Имя', 'Расстояние']);
    }

    preparePagination() {
        this.pagination = makeElement('div', 'tablePagination');
    }

    getTable() {
        this.fillTable();
        return this.container;
    }

    getPagination() {
        this.fillPagination();
        return this.pagination;
    }

    fillTable() {
        let dummyData = [
            {
                position: 1,
                icon: Svg.star,
                name: 'Илон Маск',
                result: '1337.32&nbsp;м'
            },
            {
                position: 2,
                icon: Svg.star,
                name: 'Тони Старк',
                result: '923.35&nbsp;м'
            },
            {
                position: 3,
                icon: Svg.star,
                name: 'Сильвана Ветрокрылая',
                result: '812.24&nbsp;м'
            },
            {
                position: 4,
                icon: '',
                name: 'Норман Ридус',
                result: '762.12&nbsp;м'
            },
            {
                position: 5,
                icon: '',
                name: 'Константин Константинопольский',
                result: '677.25&nbsp;м'
            },
            {
                position: 6,
                icon: '',
                name: 'Тодд Говард',
                result: '598.64&nbsp;м'
            },
            {
                position: 7,
                icon: '',
                name: 'Джеймс Кэмерон',
                result: '485.63&nbsp;м'
            },
            {
                position: 8,
                icon: '',
                name: 'Геральт из Ривии',
                result: '427.88&nbsp;м'
            },
            {
                position: 9,
                icon: '',
                name: 'Олег',
                result: '317.36&nbsp;м'
            },
            {
                position: 10,
                icon: '',
                name: 'Элизабет Комсток',
                result: '277.01&nbsp;м'
            },
        ];

        dummyData.forEach(item => {
            let row = makeElement('div', 'table__row');
            this.container.appendChild(row);
            this.fillRow(row, Object.values(item));
        });
    }

    fillPagination() {
        let len = 10;

        for (let i = 1; i <= len; i++){
            let button = makeElement('div', 'tablePagination__item', {
                textContent: i,
                // data: {
                //     click: 'loadTable'
                // }
            });

            this.pagination.appendChild(button);

            if (i === 1) {
                button.classList.add('state--active');
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
import React, { useEffect, useRef, useState } from 'react';
import {
    DataTypeProvider,
} from '@devexpress/dx-react-grid';
import {
    Table,
} from '@devexpress/dx-react-grid-bootstrap4';
import '@devexpress/dx-react-grid-bootstrap4/dist/dx-react-grid-bootstrap4.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faPlus, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import PriceFormat from '../../../../components/PriceFormat';
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import InputIcon from 'react-multi-date-picker/components/input_icon';
import Select from 'react-select';
import _ from 'lodash';
import DropdownTreeSelect from 'react-dropdown-tree-select';
import 'react-dropdown-tree-select/dist/styles.css'
import { TreeSelect } from 'primereact/treeselect';

export const TableComponent = ({ ...restProps }) => (
    <Table.Table
        {...restProps}
        className="table-bordered accounting-table"
    />
);

export const PriceTypeProvider = props => (
    <DataTypeProvider
        formatterComponent={row => (<PriceFormat price={row.value} showCurrency={false} decimalScale={0} accounting={true} />)}
        {...props}
    />
);

const SelectFilterCell = ({ filter, onFilter, options }) => (
    <th className='th-filter'>
        <Select
            value={options.find(x => x.value == filter?.value) ?? null}
            onChange={(selected) => onFilter(selected ? { value: selected.value } : null)}
            noOptionsMessage={() => "هیچ گزینه ای یافت نشد"}
            placeholder=""
            options={options ?? []}
            styles={{
                control: (provided) => ({ ...provided, height: "38px", minHeight: "38px" }),
                valueContainer: (provided) => ({ ...provided, height: '38px', padding: '0 6px' }),
                input: (provided) => ({ ...provided, height: "38px", maxHeight: "38px", minWidth: "180px" }),
                indicatorSeparator: (provided) => ({ ...provided, display: 'none' }),
                indicatorsContainer: (provided) => ({ ...provided, height: "38px", padding: '0 6px', margin: 0 }),
                placeholder: (provided) => ({ ...provided, height: "38px", padding: '4px 6px' }),
                menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
            }}
        />
    </th>
);

const DateFillterCell = ({ filter, onFilter }) => (
    <th className='th-filter'>
        <DatePicker
            format="YYYY/MM/DD"
            value={filter ? filter.value : null}
            onChange={(x) => {
                _.debounce(() => onFilter(x ? { value: x.toDate().toISOString() } : null), 500)();
            }}
            calendar={persian}
            locale={persian_fa}
            render={<InputIcon />}
            maxDate={new DateObject()}
            inputClass="disabled"
            fixMainPosition={true}
        />
    </th>
);

const FilterCellComponent = ({ filter, onFilter }) => {
    const inputRef = useRef(null);
    return (
        <th className='th-filter'>
            <div className='input-group'>
                <input
                    type="text"
                    onChange={e => {
                        _.debounce(() => onFilter(e.target.value ? { value: e.target.value } : null), 1000)();
                    }}
                    ref={inputRef}
                    style={{ height: "35px", width: "100%" }}
                />
                {filter &&
                    <div className="input-group-append position-absolute" style={{
                        left: "10px", top: "50%", transform:
                            "translateY(-50%)"
                    }}>
                        <FontAwesomeIcon icon={faTimes} size='lg' className='pointer' onClick={() => {
                            inputRef.current.value = "";
                            onFilter(null);
                        }} />
                    </div>
                }
            </div>
        </th>
    )
};

export const FilterCell = (props) => {
    const { column } = props;
    if (column.name === 'created_at') {
        return <DateFillterCell {...props} />;
    }
    if (column.filterType === 'select') {
        return <SelectFilterCell {...props} options={column.filterValues} />;
    }
    return <FilterCellComponent {...props} />;
};

export const Cell = (props, page, perPage, handleDoubleClick) => {
    const { column, row, tableRow } = props;
    if (column.name === 'no') {
        return <Table.Cell
            className='text-center'
            onDoubleClick={() => handleDoubleClick(row)}
            value={page * perPage + tableRow.rowId + 1}
        />;
    }
    return <Table.Cell
        {...props}
        onDoubleClick={() => handleDoubleClick(row)}
    />;
};

export const AccountSelector = ({ account, accounts, setAccount, placeholder = "انتخاب حساب" }) => {
    let options = accounts.map(x => {
        return {
            id: x.id,
            key: x.id,
            label: x.code + ' - ' + x.name,
            value: x.id,
            checked: account?.id == x.id,
            parent_id: x.parent_id,
        }
    });
    options = options.reduce((acc, item) => {
        acc.set(item.id, item)

        const parent = item.parent_id === null
            ? acc.get('root')
            : (acc.get(item.parent_id).children ??= [])

        parent.push(item)
        return acc
    }, new Map([['root', []]])).get('root')
    return (
        <TreeSelect
            options={options}
            value={account ? account.id : null}
            onChange={e => {
                setAccount(accounts.find(x => x.id == e.value));
                return accounts.find(x => x.id == e.value);
            }}
            filter
            placeholder={placeholder}
            emptyMessage="..."
            pt={{
                root: { style: { minWidth: '200px', height: '38px' } },
                tree: {
                    content: ({ context }) => ({
                        className: context.expanded ? 'chevron-rotate' : 'chevron',
                    })
                }
            }}
        />
    );
};
export const MultipleAccountSelector = ({ selectedAccounts, accounts, setSelectedAccounts }) => {
    const [selectedNodes, setSelectedNodes] = useState([]);
    let options = accounts.map(x => {
        return {
            id: x.id,
            key: x.id,
            label: x.code + ' - ' + x.name,
            value: x.id,
            parent_id: x.parent_id,
            checked: selectedAccounts ? selectedAccounts.map(x => x.id).includes(x.id) : false,
        }
    });
    options = options.reduce((acc, item) => {
        acc.set(item.id, item)

        const parent = item.parent_id === null
            ? acc.get('root')
            : (acc.get(item.parent_id).children ??= [])

        parent.push(item)
        return acc
    }, new Map([['root', []]])).get('root')
    return (
        <TreeSelect
            options={options}
            value={selectedNodes}
            onChange={e => {
                const ids = Object.keys(e.value).map(x => parseInt(x));
                const arr = accounts.filter(x => ids.includes(x.id));
                setSelectedAccounts(arr);
                setSelectedNodes(e.value);
            }}
            filter
            placeholder="انتخاب حساب"
            emptyMessage="..."
            selectionMode="checkbox"
            pt={{
                root: { style: { minWidth: '200px', height: '38px' } },
                tree: {
                    content: ({ context }) => ({
                        className: context.expanded ? 'chevron-rotate' : '',
                    })
                }
            }}
        />
    );
};

export const _AccountSelector = ({ account, accounts, setAccount }) => {
    return (
        <>
            <DropdownTreeSelect
                data={options}
                mode="radioSelect"
                texts={{ placeholder: "انتخاب حساب", inlineSearchPlaceholder: "جستجو...", noMatches: "..." }}
                keepTreeOnSearch={true}
                keepChildrenOnSearch={true}
                keepOpenOnSelect={false}
                inlineSearchInput={true}
                onChange={e => {
                    setAccount(accounts.find(x => x.id == e.value));
                }}
            />
            <Select
                value={account ?? null}
                onChange={setAccount}
                noOptionsMessage={() => "..."}
                placeholder="انتخاب حساب"
                options={accounts}
                menuPortalTarget={document.body}
                getOptionLabel={(option) => option.code + " - " + option.name}
                getOptionValue={(option) => option.code}
                styles={{
                    control: (provided) => ({ ...provided, height: "38px", minHeight: "38px" }),
                    valueContainer: (provided) => ({ ...provided, height: '38px', padding: '0 6px' }),
                    input: (provided) => ({ ...provided, height: "38px", maxHeight: "38px", minWidth: "180px" }),
                    indicatorSeparator: (provided) => ({ ...provided, display: 'none' }),
                    indicatorsContainer: (provided) => ({ ...provided, height: "38px", padding: '0 6px', margin: 0 }),
                    placeholder: (provided) => ({ ...provided, height: "38px", padding: '4px 6px' }),
                    menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
                }}
            />
        </>
    );
};

export const TrialColumnsSelector = ({ hiddenColumnNames, setHiddenColumnNames }) => {
    const options = [
        {
            value: [
                'debit_balance',
                'credit_balance',
                'remaining_debit',
                'remaining_credit',
            ],
            label: '2 ستونه'
        },
        {
            value: [
                'remaining_debit',
                'remaining_credit',
            ],
            label: '4 ستونه'
        },
        {
            value: [
            ],
            label: '6 ستونه'
        },
    ];
    return (
        <Select
            value={options.find(x => _.isEqual(x.value, hiddenColumnNames)) ?? null}
            onChange={(selected) => setHiddenColumnNames(selected ? selected.value : [])}
            noOptionsMessage={() => "..."}
            placeholder="انتخاب حساب"
            options={options}
            menuPortalTarget={document.body}
            getOptionLabel={(option) => option.label}
            getOptionValue={(option) => option.label}
            styles={{
                control: (provided) => ({ ...provided, height: "38px", minHeight: "38px" }),
                valueContainer: (provided) => ({ ...provided, height: '38px', padding: '0 6px' }),
                input: (provided) => ({ ...provided, height: "38px", maxHeight: "38px", minWidth: "180px" }),
                indicatorSeparator: (provided) => ({ ...provided, display: 'none' }),
                indicatorsContainer: (provided) => ({ ...provided, height: "38px", padding: '0 6px', margin: 0 }),
                placeholder: (provided) => ({ ...provided, height: "38px", padding: '4px 6px' }),
                menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
            }}
        />
    );
};

export const handleExcelData = (data, columns) => {
    const excelData = [];
    data.forEach((item) => {
        let row = {};
        columns.forEach((column) => {
            row[column.title] = column.getCellValue(item);
        });
        excelData.push(row);
    });
    return excelData;
};

export const _handleExcelData = (data, columns, tree = false) => {
    const excelData = [];
    let newData = data;
    if (tree) {
        newData = newData.slice().sort((a, b) => a.id - b.id);
        newData = newData.reduce((acc, item) => {
            acc.set(item.id, item)

            const parent = item.parent_id === null
                ? acc.get('root')
                : (acc.get(item.parent_id).children ??= [])

            parent.push(item)
            return acc
        }, new Map([['root', []]])).get('root')
    }
    newData.forEach((item) => {
        let row = {};
        columns.forEach((column) => {
            row[column.title] = column.getCellValue(item);
        });
        excelData.push(row);
        if (item.children) {
            item.children.forEach((child) => {
                let row = {};
                columns.forEach((column) => {
                    row[column.title] = column.getCellValue(child);
                });
                excelData.push(row);
            });
        }
    });
    return excelData;
};

export const tableMessages = {
    TableFilterRow: {
        filterPlaceholder: '...',
        contains: 'شامل',
        notContains: 'مخالف',
        startsWith: 'شروع با',
        endsWith: 'پایان با',
        equal: 'مساوی',
        notEqual: 'مخالف',
        greaterThan: 'بزرگتر',
        greaterThanOrEqual: 'بزرگتر یا مساوی',
        lessThan: 'کوچکتر',
        lessThanOrEqual: 'کوچکتر یا مساوی',
    },
    PagingPanel: {
        rowsPerPage: "تعداد سطر در هر صفحه",
        showAll: "همه",
    },
    VirtualTable: {
        noData: "هیچ داده ای یافت نشد",
    },
    TableSummaryRow: {
        sum: "مجموع",
    },
};

export const tableConfigs = {
    pageSizes: [20, 50, 100, 200, 500, 1000, 0],
    resizingMode: "widget",
};
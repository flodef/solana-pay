import BigNumber from 'bignumber.js';
import clsx from 'clsx';
import { useLiveQuery } from 'dexie-react-hooks';
import React, { FC, useMemo } from 'react';
import { FormattedMessage, FormattedRelativeTime } from 'react-intl';
import { useConfig } from '../../hooks/useConfig';
import { Transaction, useTransactions } from '../../hooks/useTransactions';
import { CURRENCY_LIST, DEVNET_DUMMY_MINT } from '../../utils/constants';
import { db } from '../../utils/db';
import { APP_TITLE, FAUCET_ADDRESS } from '../../utils/env';
import { Amount } from './Amount';
import css from './Transactions.module.css';

interface AddressIndex {
    address: string;
    label: string;
}

export const Transactions: FC = () => {
    const { transactions } = useTransactions();
    const addressIndexList = useLiveQuery(async () => await db.merchants.toArray())?.map((x) => {
        return { address: x.address, label: x.company };
    });
    addressIndexList?.push({ address: FAUCET_ADDRESS ?? '', label: APP_TITLE });

    return (
        <div className={css.root}>
            <div className={css.title}>
                <FormattedMessage id="recentTransactions" />
            </div>
            {transactions.map((transaction) => (
                <Transaction
                    key={transaction.signature}
                    transaction={transaction}
                    addressIndexList={addressIndexList}
                />
            ))}
        </div>
    );
};

const Transaction: FC<{ transaction: Transaction; addressIndexList: AddressIndex[] | undefined }> = ({
    transaction,
    addressIndexList,
}) => {
    const { icon: defaultIcon } = useConfig();
    const icon = useMemo(() => {
        return transaction.mint === DEVNET_DUMMY_MINT.toString()
            ? defaultIcon
            : React.createElement(
                  Object.values(CURRENCY_LIST).find((x) => x.splToken?.toString() === transaction.mint)?.icon || ''
              );
    }, [defaultIcon, transaction.mint]);
    const amount = useMemo(() => new BigNumber(transaction.amount), [transaction.amount]);
    const label = useMemo(
        () =>
            addressIndexList?.find((x) => x.address === transaction.destination)?.label ||
            transaction.destination.slice(0, 4) + '....' + transaction.destination.slice(-4),
        [addressIndexList, transaction.destination]
    );

    return (
        <div className={css.transaction}>
            <div className={css.icon}>{icon}</div>
            <div className={css.left}>
                <div className={css.amount}>
                    <Amount value={amount} showZero />
                </div>
                <div className={css.signature}>{label}</div>
            </div>
            <div className={css.right}>
                <div className={css.time}>
                    <FormattedRelativeTime
                        value={transaction.timestamp - Date.now() / 1000}
                        updateIntervalInSeconds={1}
                    />
                </div>
                <div className={clsx(css.status, css[`status-${transaction.status}`])}>
                    <FormattedMessage id={transaction.status} />
                </div>
            </div>
        </div>
    );
};

import { getTransactionsAction } from "@/actions/transactions.actions";
import {
  Table,
  TableThead,
  TableTbody,
  TableTh,
  TableTr,
  TableTd,
} from "@mantine/core";

async function getTransactions() {
  "use cache";
  const data = await getTransactionsAction();
  return data;
}

export default async function Home() {
  const elements = await getTransactions();

  const rows = elements.map((element) => (
    <TableTr key={element.id}>
      <TableTd>{element.date.toLocaleDateString("es-MX")}</TableTd>
      <TableTd>{element.description}</TableTd>
      <TableTd>{element.amount}</TableTd>
    </TableTr>
  ));

  return (
    <Table>
      <TableThead>
        <TableTr>
          <TableTh>Fecha</TableTh>
          <TableTh>Concepto</TableTh>
          <TableTh>Monnto</TableTh>
        </TableTr>
      </TableThead>
      <TableTbody>{rows}</TableTbody>
    </Table>
  );
}

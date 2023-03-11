/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { btn } from "../pages/index";
import type { ColumnDef } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useReducer, useState } from "react";
import { GoArrowLeft, GoArrowRight } from "react-icons/go";
import { api } from "../utils/api";
import { type BirdVoteResult } from "~/interfaces/votes";


const ResultsPage: NextPage = () => {
  const rerender = useReducer(() => ({}), {})[1];

  const columns = useMemo<ColumnDef<BirdVoteResult>[]>(
    () => [
      {
        header: "Images",
        accessorKey: "photoUrls",
        cell: (info) => {
          return <BirdImage urlImages={info.getValue() as string[]} />;
        },
      },
      {
        header: "Name",
        accessorKey: "commonName",
        cell: (info) => info.getValue(),
      },
      {
        header: "Scientific Name",
        accessorKey: "scientificName",
        cell: (info) => info.getValue(),
      },
      {
        header: "Results",
        accessorKey: "percentFor",
        cell: (info) => `${info.getValue() as number} %`,
      },
    ],
    []
  );

  interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

  const [{ pageIndex, pageSize }, setPagination]  = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading, isFetching } =
    api.example.fetchVotesPagination.useQuery(
      {
        limit: pageSize,
        offset: pageIndex * pageSize,
      },
      { keepPreviousData: true }
    );

  const defaultData = useMemo(() => [], []);

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const table = useReactTable({
    data: data?.rows ?? defaultData,
    columns,
    pageCount: data?.totalRows ? Math.ceil(data?.totalRows / pageSize) : -1,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    getPaginationRowModel: getPaginationRowModel(), // If only doing manual pagination, you don't need this
    debugTable: true,
  });

  return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-center">
      <Head>
        <title>Birbiest Birbs Results</title>
        <meta name="description" content="Birbiest Birbs" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div></div>
      <div className="text-center text-3xl">Results</div>
      <div className="flex text-center text-3xl">
        <div className="pr-2">Who is top of the </div>
        <Image
          src="/rock.png"
          alt="rock"
          width="64"
          height="64"
          priority={true}
        />
      </div>
      <div className="text-1xl p-2 text-center">
        Results are calculated by <b>votes for</b> vs <b>votes against</b>.
        <br></br>A rating of 100% means that every time the bird appeared it was
        voted for.
      </div>
      <div></div>
      {isLoading && (
        <div className="text-1xl flex flex-col items-center text-center">
          <img className="w-48" src="hearts.svg"></img>
          <div className="p-3">Loading ... </div>
        </div>
      )}
      {!isLoading && (
        <div className="max-h-[50%] min-h-[30%] flex-col items-center overflow-x-auto rounded border">
          <table className="table-auto">
            <thead
              className={
                "sticky top-0 z-[5] h-12 border-b-2 bg-gray-500 pb-2 text-center"
              }
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        className={
                          header.id === "photoUrls" ||
                          header.id === "percentFor"
                            ? header.id === "photoUrls"
                              ? "pl-6"
                              : "pr-6"
                            : ""
                        }
                      >
                        {header.isPlaceholder ? null : (
                          <div>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="text-center">
              {table.getRowModel().rows.map((row) => {
                return (
                  <tr
                    key={row.id}
                    className={
                      Number(row.id) % 2 !== 0
                        ? "border-b-2 bg-slate-500"
                        : "border-b-2"
                    }
                  >
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <td
                          key={cell.id}
                          className={
                            cell.column.id === "photoUrls" ||
                            cell.column.id === "percentFor"
                              ? cell.column.id === "photoUrls"
                                ? "p-2 pl-6"
                                : "p-2 pr-6"
                              : "p-2"
                          }
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {!isLoading && (
        <>
          <div className="h-6" />
          <div className="flex items-center justify-items-center gap-2">
            <button
              className="rounded border p-1"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              {"<<"}
            </button>
            <button
              className="rounded border p-1"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {"<"}
            </button>
            <button
              className="rounded border p-1"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {">"}
            </button>
            <button
              className="rounded border p-1"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              {">>"}
            </button>
            <span className="flex items-center gap-1">
              <div>Page</div>
              <strong>
                {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </strong>
            </span>
            <span className="flex items-center gap-1">
              | Go to page:
              <input
                type="number"
                defaultValue={table.getState().pagination.pageIndex + 1}
                onChange={(e) => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0;
                  table.setPageIndex(page);
                }}
                className="w-16 rounded border p-1 text-black"
              />
            </span>
            <div>| {table.getRowModel().rows.length} Rows:</div>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className="text-black"
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-center justify-items-center gap-2">
            {isFetching ? "Loading..." : null}
          </div>
        </>
      )}
      <div className="p-6"></div>
      <Link href="/" className={btn}>
        Go Vote!
      </Link>
    </div>
  );
};

export default ResultsPage;

const BirdImage: React.FC<{
  urlImages: string[] | [];
}> = (props) => {
  const { urlImages } = props;

  const [showModal, setShowModal] = useState<boolean>(false);

  const [birdImageCounter, setBirdImageCounter] = useState(0);

  useEffect(() => {
    setBirdImageCounter(0);
  }, [urlImages]);

  return (
    <>
      <div className="hover-img relative flex h-32 max-h-32 w-32 max-w-[128px] object-contain">
        <Image
          src={urlImages[birdImageCounter] || ""}
          alt="Invalid Image Please Select next Image"
          width={128}
          height={128}
          style={{ objectFit: "contain" }}
          className="animate-fade-in"
          onClick={() => setShowModal(true)}
          priority={true}
        />
      </div>
      {showModal ? (
        <>
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none">
            <div className="relative my-6 mx-auto w-auto max-w-3xl">
              <div>
                <div className="relative flex flex-auto items-center justify-center p-6 ">
                  <div className="p-6">
                    <button
                      onClick={() =>
                        setBirdImageCounter(
                          birdImageCounter - 1 < 0
                            ? urlImages.length - 1
                            : birdImageCounter - 1
                        )
                      }
                    >
                      <GoArrowLeft size={28} />
                    </button>
                  </div>
                  <div>
                    <div className="relative flex h-[544px] max-h-[544px] w-[576px] max-w-xl object-contain sm:h-[640px] sm:w-[640px] md:h-[768px] md:max-h-[768px] md:max-w-[768px] lg:w-[1200px] lg:max-w-[1200px]">
                      <Image
                        src={urlImages[birdImageCounter] || ""}
                        alt="Invalid Image Please Select next Image"
                        fill
                        style={{ objectFit: "contain" }}
                        className="animate-fade-in"
                        sizes="(max-width: 768px) 100vw,
              (max-width: 1200px) 50vw,
              33vw"
                      />
                    </div>
                  </div>

                  <div className="p-6">
                    <button
                      onClick={() =>
                        setBirdImageCounter(
                          birdImageCounter + 1 < urlImages.length
                            ? birdImageCounter + 1
                            : 0
                        )
                      }
                    >
                      <GoArrowRight size={28} />
                    </button>
                  </div>
                </div>
                <div>
                  <div className="flex justify-center p-4 text-xl">
                    {birdImageCounter + 1}/{urlImages.length}
                  </div>
                  <div className="flex items-center justify-end ">
                    <button
                      className="background-transparent mr-1 mb-1 px-6 py-2 text-sm font-bold uppercase text-red-500 outline-none transition-all duration-150 ease-linear focus:outline-none "
                      type="button"
                      onClick={() => setShowModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="fixed inset-0 z-40 bg-black opacity-50"></div>
        </>
      ) : null}
    </>
  );
};

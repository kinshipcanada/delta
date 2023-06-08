import React from "react";
import { classNames } from "../../system/utils/helpers"
import { TableProps } from "./types";

export const Table: React.FC<TableProps> = ({ headers, rows }) => {

    return (
      <div>
        <div className="flow-root">
          <div className="">
            <div className="inline-block min-w-full py-2 align-middle">
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr>
                    {headers.map((header)=>(
                        <th
                            scope="col"
                            className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                        >
                            { header }
                        </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {headers.map((header)=>(
                        <td
                            className={classNames(
                            rowIdx !== rows.length - 1 ? 'border-b border-gray-200' : '',
                            'whitespace-nowrap hidden px-3 py-4 text-sm text-gray-500 lg:table-cell'
                            )}
                        >
                            {row[header]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
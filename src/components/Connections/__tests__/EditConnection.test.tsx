import {
  render,
  screen,
  within,
  fireEvent,
  act,
  waitFor,
} from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';
import CreateConnectionForm from '../CreateConnectionForm';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { SWRConfig } from 'swr';

jest.mock('next/router', () => ({
  useRouter() {
    return {
      push: jest.fn(),
    };
  },
}));

describe('Edit connection', () => {
  const mockSession: Session = {
    expires: 'false',
    user: { email: 'a' },
  };

  const SOURCES = [
    {
      name: 'Source 1',
      sourceId: 'source-1-id',
    },
    {
      name: 'Source 2',
      sourceId: 'source-2-id',
    },
  ];

  const STREAMS = [
    {
      name: 'stream-1',
      supportedSyncModes: ['full_refresh', 'incremental'],
    },
    {
      name: 'stream-2',
      supportedSyncModes: ['full_refresh'],
    },
  ];

  const CONNECTION_EDITED = {
    name: 'test-conn-1',
    source: { name: 'Source 1', id: 'source-1-id' },
    destinationSchema: 'staging',
    syncCatalog: {
      streams: [
        {
          stream: {
            name: 'stream-1',
            supportsIncremental: true,
            selected: true,
            supportedSyncModes: ['full_refresh'],
          },
          config: {
            syncMode: 'full_refresh',
            destinationSyncMode: 'append',
          },
        },
      ],
    },
  };

  it('Edit connection - check prefilled values', async () => {
    (global as any).fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(CONNECTION_EDITED),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(SOURCES),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({
          catalog: {
            streams: [
              {
                stream: STREAMS[0],
              },
              {
                stream: STREAMS[1],
              },
            ],
          },
        }),
      });

    await act(async () => {
      render(
        <SessionProvider session={mockSession}>
          <CreateConnectionForm
            mutate={() => {}}
            showForm={true}
            setShowForm={() => {}}
            blockId={'edit-conn-block'}
            setBlockId={() => {}}
          />
        </SessionProvider>
      );
    });

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    const connectionName: HTMLInputElement = screen.getByLabelText('Name*');
    expect(connectionName.value).toBe(CONNECTION_EDITED.name);

    const schemaName: HTMLInputElement =
      screen.getByLabelText('Destination Schema');
    expect(schemaName.value).toBe(CONNECTION_EDITED.destinationSchema);

    const sourceAutoCompelete = screen.getByTestId('sourceList');
    const sourceTextInput: HTMLInputElement =
      within(sourceAutoCompelete).getByRole('combobox');
    expect(sourceTextInput.value).toBe(CONNECTION_EDITED.source.name);

    // check if the source stream table is pushed to the dom
    const sourceStreamTable = await screen.findByTestId('sourceStreamTable');
    await waitFor(() => expect(sourceStreamTable).toBeInTheDocument());

    // source stream table should have two rows i.e. header and one source stream
    const sourceStreamTableRows = within(sourceStreamTable).getAllByRole('row');
    expect(sourceStreamTableRows.length).toBe(
      CONNECTION_EDITED.syncCatalog.streams.length + 1
    );

    const streamRowCells = within(sourceStreamTableRows[1]).getAllByRole(
      'cell'
    );
    expect(streamRowCells.length).toBe(4);
    expect(streamRowCells[0].textContent).toBe(
      CONNECTION_EDITED.syncCatalog.streams[0].stream.name
    );

    const streamSyncSwitch = screen.getByTestId('stream-sync-0').firstChild;
    expect(streamSyncSwitch).toBeChecked();

    const incrementalStreamSyncSwitch = screen.getByTestId(
      'stream-incremental-0'
    ).firstChild;
    expect(incrementalStreamSyncSwitch).not.toBeChecked();

    expect(streamRowCells[3].childNodes[0].childNodes[1].value).toBe(
      CONNECTION_EDITED.syncCatalog.streams[0].config.destinationSyncMode
    );
    // expect(streamRowCells[3].textContent).toBe();
  });
});

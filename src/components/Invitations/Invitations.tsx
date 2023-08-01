import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ActionsMenu } from '../UI/Menu/Menu';
import { List } from '../List/List';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import useSWR from 'swr';
import moment from 'moment';
import { backendUrl } from '@/config/constant';
import ConfirmationDialog from '../Dialog/ConfirmationDialog';
import { httpDelete, httpPost } from '@/helpers/http';
import { errorToast, successToast } from '../ToastMessage/ToastHelper';
import { useSession } from 'next-auth/react';
import { GlobalContext } from '@/contexts/ContextProvider';

const headers = ['Email', 'Role', 'Status', 'Sent On'];

type Invitation = {
  id: number;
  invited_email: string;
  invited_role_slug: string;
  invited_role: number;
  invited_on: string;
  status: string;
};

interface InvitationsInterface {
  mutateInvitationsParent: boolean;
  setMutateInvitationsParent: (...args: any) => any;
}

const Invitations = ({
  mutateInvitationsParent,
  setMutateInvitationsParent,
}: InvitationsInterface) => {
  const { data, isLoading, mutate } = useSWR(
    `${backendUrl}/api/users/invitations/`
  );
  const globalContext = useContext(GlobalContext);
  const { data: session }: any = useSession();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] =
    useState<boolean>(false);
  const [invitationToBeDeleted, setInvitationToBeDeleted] =
    useState<Invitation | null>(null);

  const openActionMenu = Boolean(anchorEl);
  const handleClick = (invitation: Invitation, event: HTMLElement | null) => {
    setInvitationToBeDeleted(invitation);
    setAnchorEl(event);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClickDeleteAction = () => {
    handleClose();
    setShowConfirmDeleteDialog(true);
  };

  useEffect(() => {
    if (mutateInvitationsParent) {
      mutate();
      setMutateInvitationsParent(false);
    }
  }, [mutateInvitationsParent]);

  const handleCancelDeleteInvitation = () => {
    setInvitationToBeDeleted(null);
    setShowConfirmDeleteDialog(false);
  };

  let rows = [];
  rows = useMemo(() => {
    if (data && data.length > 0) {
      return data.map((invitation: Invitation, idx: number) => [
        <Typography key={'email-' + idx} variant="body1" fontWeight={600}>
          {invitation.invited_email}
        </Typography>,
        <Typography key={'role-' + idx} variant="subtitle2" fontWeight={600}>
          {invitation.invited_role_slug.replace('_', ' ')}
        </Typography>,
        <Typography key={'status-' + idx} variant="subtitle2" fontWeight={600}>
          {invitation.status}
        </Typography>,
        <Typography key={'status-' + idx} variant="subtitle2" fontWeight={600}>
          {moment
            .utc(invitation.invited_on)
            .local()
            .format('Do MMM hh:mm A')
            .toString()}
        </Typography>,
        <Box
          sx={{ justifyContent: 'end', display: 'flex' }}
          key={'action-box-' + idx}
        >
          {invitation.status !== 'accepted' && (
            <Button
              aria-controls={openActionMenu ? 'basic-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={openActionMenu ? 'true' : undefined}
              onClick={(event) => handleClick(invitation, event.currentTarget)}
              variant="contained"
              key={'menu-' + idx}
              color="info"
              sx={{ px: 0, minWidth: 32 }}
            >
              <MoreHorizIcon />
            </Button>
          )}
        </Box>,
      ]);
    }
    return [];
  }, [data]);

  const deleteInvitation = async (invitation: Invitation | null) => {
    if (invitation) {
      setLoading(true);
      try {
        await httpDelete(session, `users/invitations/delete/${invitation.id}`);
        successToast('Invitation rescinded successfully', [], globalContext);
        mutate();
      } catch (err: any) {
        console.error(err);
        errorToast(err.message, [], globalContext);
      }
      setLoading(false);
    }
    handleCancelDeleteInvitation();
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <>
      <ActionsMenu
        eleType="invitation"
        anchorEl={anchorEl}
        open={openActionMenu}
        handleClose={handleClose}
        handleDelete={handleClickDeleteAction}
      />
      <List
        openDialog={() => {}}
        title=""
        headers={headers}
        rows={rows}
        onlyList={true}
      />
      <ConfirmationDialog
        show={showConfirmDeleteDialog}
        handleClose={() => handleCancelDeleteInvitation()}
        handleConfirm={() => deleteInvitation(invitationToBeDeleted)}
        message="The invitation sent to this user becomes invalid."
        loading={loading}
      />
    </>
  );
};

export default Invitations;

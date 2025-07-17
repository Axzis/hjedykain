'use client';

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { MemberForm } from './member-form';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import type { Member } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function AddMemberDialog() {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  return (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">Add New Member</DialogTitle>
          <DialogDescription>
            Fill in the details for the new member.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-4 -m-4">
          <MemberForm onFormSubmit={() => setIsAddDialogOpen(false)} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export function MemberActions({ member }: { member: Member }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  const handleDeleteMember = async (memberId: string) => {
    try {
      await deleteDoc(doc(db, 'members', memberId));
      toast({
        title: 'Member Deleted',
        description: 'The member has been successfully deleted.',
      });
      router.refresh();
    } catch (e) {
      console.error('Error deleting member: ', e);
      toast({
        title: 'Error Deleting Member',
        description: 'There was an issue deleting the member. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AlertDialog>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(member.id)}>
              Copy member ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DialogTrigger asChild>
              <DropdownMenuItem>Edit member</DropdownMenuItem>
            </DialogTrigger>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                Delete member
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline">Edit Member</DialogTitle>
            <DialogDescription>
              Make changes to the member details here. Click save when you're
              done.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] p-4 -m-4">
            <MemberForm
              member={member}
              onFormSubmit={() => setIsEditDialogOpen(false)}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            member's data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleDeleteMember(member.id)}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

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
import { UserForm } from './user-form';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import type { User } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function AddUserDialog() {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  return (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">Add New User</DialogTitle>
          <DialogDescription>
            Fill in the details for the new user.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-4 -m-4">
          <UserForm onFormSubmit={() => setIsAddDialogOpen(false)} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export function UserActions({ user }: { user: User }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      toast({
        title: 'User Deleted',
        description: 'The user has been successfully deleted.',
      });
      router.refresh();
    } catch (e) {
      console.error('Error deleting user: ', e);
      toast({
        title: 'Error Deleting User',
        description: 'There was an issue deleting the user. Please try again.',
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
              Copy user ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DialogTrigger asChild>
              <DropdownMenuItem>Edit user</DropdownMenuItem>
            </DialogTrigger>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                Delete user
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline">Edit User</DialogTitle>
            <DialogDescription>
              Make changes to the user details here. Click save when you're
              done.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] p-4 -m-4">
            <UserForm
              user={user}
              onFormSubmit={() => setIsEditDialogOpen(false)}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the user
            account and remove their data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

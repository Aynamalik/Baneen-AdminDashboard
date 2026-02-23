import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { adminApi } from '../../services/api/admin.api';

const PlanFormDialog = ({ open, onClose, plan = null, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ridesIncluded, setRidesIncluded] = useState(10);
  const [price, setPrice] = useState(0);
  const [validityDays, setValidityDays] = useState(30);

  useEffect(() => {
    if (plan) {
      setName(plan.name ?? '');
      setDescription(plan.description ?? '');
      setRidesIncluded(plan.ridesIncluded ?? 10);
      setPrice(plan.price ?? 0);
      setValidityDays(plan.validityDays ?? 30);
    } else {
      setName('');
      setDescription('');
      setRidesIncluded(10);
      setPrice(0);
      setValidityDays(30);
    }
  }, [plan, open]);

  const createMutation = useMutation({
    mutationFn: (body) => adminApi.createSubscriptionPlan(body),
    onSuccess: () => {
      onSuccess?.();
      onClose?.();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ planId, body }) => adminApi.updateSubscriptionPlan(planId, body),
    onSuccess: () => {
      onSuccess?.();
      onClose?.();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const body = { name, description, ridesIncluded: Number(ridesIncluded), price: Number(price), validityDays: Number(validityDays) };
    if (plan) updateMutation.mutate({ planId: plan._id, body });
    else createMutation.mutate(body);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{plan ? 'Edit Plan' : 'Create Plan'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={2}
            fullWidth
          />
          <TextField
            label="Rides included"
            type="number"
            inputProps={{ min: 1 }}
            value={ridesIncluded}
            onChange={(e) => setRidesIncluded(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Price (PKR)"
            type="number"
            inputProps={{ min: 0 }}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Validity (days)"
            type="number"
            inputProps={{ min: 1 }}
            value={validityDays}
            onChange={(e) => setValidityDays(e.target.value)}
            required
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? <CircularProgress size={24} /> : plan ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PlanFormDialog;

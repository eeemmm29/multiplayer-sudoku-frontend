import { JoinRoomForm, ModalMode } from "@/types";
import { Button } from "@heroui/button";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { useForm } from "react-hook-form";

interface CreateEnterRoomModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  mode: ModalMode;
}

const CreateEnterRoomModal: React.FC<CreateEnterRoomModalProps> = ({
  isOpen,
  onOpenChange,
  onClose,
  mode,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinRoomForm>();

  const headerText =
    mode === "create" ? "A new room will be created" : "Join a Room";

  const onSubmit = (data: JoinRoomForm) => {
    // handle form submission
    console.log("Form submitted:", data);
    onClose();
  };

  return (
    <Modal
      size="xs"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onClose={onClose}
    >
      <ModalContent>
        <ModalHeader>{headerText}</ModalHeader>
        <Form onSubmit={handleSubmit(onSubmit)}>
          {mode === "join" && (
            <ModalBody>
              <Input
                label="Room Code (4 characters)"
                {...register("roomCode", {
                  required: "Room code is required",
                  minLength: { value: 4, message: "Must be 4 characters" },
                  maxLength: { value: 4, message: "Must be 4 characters" },
                  pattern: {
                    value: /^[A-Za-z0-9]{4}$/,
                    message: "Only letters and numbers allowed",
                  },
                })}
                maxLength={4}
              />
              {errors.roomCode && (
                <span className="text-red-500 text-xs">
                  {errors.roomCode.message}
                </span>
              )}
            </ModalBody>
          )}
          <ModalFooter className="w-full">
            <Button color="danger" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="success" type="submit">
              Submit
            </Button>
          </ModalFooter>
        </Form>
      </ModalContent>
    </Modal>
  );
};

export default CreateEnterRoomModal;

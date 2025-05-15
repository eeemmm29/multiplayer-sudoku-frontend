import { CreateRoomResponse, JoinRoomForm, ModalMode } from "@/types";
import { useSocket } from "@/utils/useSocket";
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
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";

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
  const { control, handleSubmit } = useForm<JoinRoomForm>();
  const router = useRouter();
  const clientRef = useSocket();

  const headerText =
    mode === "create" ? "A new room will be created" : "Join a Room";

  const onSubmit = async (data: JoinRoomForm) => {
    // Wait for STOMP client to be connected before sending
    if (!clientRef.current || !clientRef.current.connected) return;
    if (mode === "create") {
      // Subscribe to room created response
      const sub = clientRef.current.subscribe(
        "/user/topic/room/created",
        (message) => {
          const response: CreateRoomResponse = JSON.parse(message.body);
          if (response && response.roomCode) {
            router.push(`/game?roomCode=${response.roomCode}`);
            onClose();
          }
          sub.unsubscribe();
        }
      );
      // Send create room request
      clientRef.current.publish({
        destination: "/app/room/create",
        body: JSON.stringify({}),
      });
    } else if (mode === "join") {
      router.push(`/game?roomCode=${data.roomCode}`);
      onClose();
    }
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
              <Controller
                name="roomCode"
                control={control}
                rules={{
                  required: "Room code is required",
                  minLength: { value: 4, message: "Must be 4 characters" },
                  maxLength: { value: 4, message: "Must be 4 characters" },
                  pattern: {
                    value: /^[A-Za-z0-9]{4}$/,
                    message: "Only letters and numbers allowed",
                  },
                }}
                render={({ field, fieldState: { invalid, error } }) => (
                  <Input
                    label="Room Code (4 characters)"
                    maxLength={4}
                    isInvalid={invalid}
                    errorMessage={error?.message}
                    {...field}
                  />
                )}
              />
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

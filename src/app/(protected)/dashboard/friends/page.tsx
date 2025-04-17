import FriendRequestCardContainer from "@/components/custom/friend-request-card-container";
import ProfileCardContainer from "@/components/custom/profile-card-container";
import SentRequestCardContainer from "@/components/custom/sent-request-card-container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TabsDemo() {
  return (
    <Tabs defaultValue="friend-request-tab" className="w-full h-full p-4">
      <TabsList className="grid grid-cols-3 w-fit rounded-full">
        <TabsTrigger value="friend-request-tab" className="rounded-full">
          Friend Requests
        </TabsTrigger>
        <TabsTrigger value="people-tab" className="rounded-full">
          People you may know
        </TabsTrigger>
        <TabsTrigger value="sent-request-tab" className="rounded-full">
          Sent Requests
        </TabsTrigger>
      </TabsList>
      <TabsContent value="friend-request-tab" className="h-full">
        <FriendRequestCardContainer />
      </TabsContent>
      <TabsContent value="people-tab" className="h-full">
        <ProfileCardContainer />
      </TabsContent>
      <TabsContent value="sent-request-tab" className="h-full">
        <SentRequestCardContainer />
      </TabsContent>
    </Tabs>
  );
}
